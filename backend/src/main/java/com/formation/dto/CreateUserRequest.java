package com.formation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    @NotBlank
    @Size(min = 3, message = "Le login doit contenir au moins 3 caractères")
    private String login;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String role;
}
