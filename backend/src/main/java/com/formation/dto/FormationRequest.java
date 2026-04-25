package com.formation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormationRequest {
    @NotBlank
    @Size(min = 3)
    private String titre;

    @NotNull
    @Min(2000)
    private Integer annee;

    @NotNull
    private LocalDate dateDebut;

    @NotNull
    private LocalDate dateFin;

    private Double budget;
    private String lieu;

    @NotNull
    private Long domaineId;

    private Long formateurId;

    private Set<Long> participantIds;
}
