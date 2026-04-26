package com.formation.controller;

import com.formation.dto.CreateUserRequest;
import com.formation.dto.LoginRequest;
import com.formation.dto.LoginResponse;
import com.formation.entity.Utilisateur;
import com.formation.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /auth/login - Login attempt for user: {}", request.getLogin());
        try {
            LoginResponse response = authService.login(request);
            log.info("Login successful for user: {} with role: {}", request.getLogin(), response.getRole());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for user {}: {}", request.getLogin(), e.getMessage(), e);
            throw e;
        }
    }

    /** Admin creates user accounts */
    @PostMapping("/create-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Utilisateur> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("POST /auth/create-user - Creating user account for: {}", request.getLogin());
        try {
            Utilisateur user = authService.createUserAccount(request);
            log.info("User account created successfully: {}", user.getLogin());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error creating user account for {}: {}", request.getLogin(), e.getMessage(), e);
            throw e;
        }
    }
}