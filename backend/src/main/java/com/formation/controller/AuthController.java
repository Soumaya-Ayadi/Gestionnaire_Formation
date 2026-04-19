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
        return ResponseEntity.ok(authService.login(request));
    }

    /** Admin creates user accounts */
    @PostMapping("/create-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Utilisateur> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(authService.createUserAccount(request));
    }
}