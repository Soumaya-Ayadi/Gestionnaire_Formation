package com.formation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "formateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2)
    @Column(nullable = false)
    private String nom;

    @NotBlank
    @Size(min = 2)
    @Column(nullable = false)
    private String prenom;

    @Email
    @NotBlank
    private String email;

    private String tel;

    // INTERNE or EXTERNE
    @NotBlank
    private String type;

    // only set when type = EXTERNE
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id")
    private Employeur employeur;
}