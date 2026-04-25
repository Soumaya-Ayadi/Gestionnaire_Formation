package com.formation.controller;

import com.formation.dto.CreateUserRequest;
import com.formation.dto.LoginRequest;
import com.formation.dto.LoginResponse;
import com.formation.entity.Utilisateur;
import com.formation.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("POST /auth/login - Login attempt for user: " + request.getLogin());
        try {
            LoginResponse response = authService.login(request);
            System.out.println("Login successful for user: " + request.getLogin() + " with role: " + response.getRole());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Login failed for user " + request.getLogin() + ": " + e.getMessage());
            throw e;
        }
    }

    /** Admin creates user accounts */
    @PostMapping("/create-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Utilisateur> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(authService.createUserAccount(request));
    }
}