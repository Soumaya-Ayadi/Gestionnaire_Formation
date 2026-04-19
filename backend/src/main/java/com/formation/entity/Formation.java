package com.formation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "formation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, message = "Le titre doit contenir au moins 3 caractères")
    @Column(nullable = false)
    private String titre;

    @NotNull
    @Min(value = 2000)
    @Column(nullable = false)
    private Integer annee;

    // duration in days
    @Min(value = 1)
    private Integer duree;

    private Double budget;

    private String lieu;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "domaine_id", nullable = false)
    private Domaine domaine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "formateur_id")
    private Formateur formateur;

    @ManyToMany
    @JoinTable(
        name = "formation_participant",
        joinColumns = @JoinColumn(name = "formation_id"),
        inverseJoinColumns = @JoinColumn(name = "participant_id")
    )
    private Set<Participant> participants = new HashSet<>();
}