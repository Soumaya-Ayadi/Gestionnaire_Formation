package com.formation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "structure")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Structure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2)
    @Column(nullable = false)
    private String libelle;

    // CENTRALE or REGIONALE
    @NotBlank
    private String type;
}