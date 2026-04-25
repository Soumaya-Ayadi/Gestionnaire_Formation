package com.formation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UtilisateurResponse {
    private Long id;
    private String login;
    private String email;
    private String role;
    private boolean active;
    private String generatedPassword; // Temporary, only sent when creating
}
