package com.formation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantRequest {
    @NotBlank
    @Size(min = 2)
    private String nom;

    @NotBlank
    @Size(min = 2)
    private String prenom;

    @Email
    private String email;

    private String tel;

    @NotNull
    private Long structureId;

    @NotNull
    private Long profilId;
}
