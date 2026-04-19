package com.formation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private String role;
    private String login;

    public LoginResponse(String token, String role, String login) {
        this.token = token;
        this.role = role;
        this.login = login;
    }
}
