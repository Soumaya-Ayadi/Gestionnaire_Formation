package com.formation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ROLE_ADMIN, ROLE_USER, ROLE_RESPONSABLE
    @Column(nullable = false, unique = true)
    private String nom;
}