package com.formation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "participant")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2, message = "Le nom doit contenir au moins 2 lettres")
    @Column(nullable = false)
    private String nom;

    @NotBlank
    @Size(min = 2, message = "Le prénom doit contenir au moins 2 lettres")
    @Column(nullable = false)
    private String prenom;

    @Email
    private String email;

    private String tel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "structure_id", nullable = false)
    private Structure structure;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "profil_id", nullable = false)
    private Profil profil;
}