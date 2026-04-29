package com.formation.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

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

    @Column(nullable = true)
    private LocalDate dateDebut;

    @Column(nullable = true)
    private LocalDate dateFin;

    private Double budget;

    private String lieu;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private FormationState etat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "domaine_id", nullable = false)
    private Domaine domaine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "formateur_id")
    private Formateur formateur;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "formation_participant",
        joinColumns = @JoinColumn(name = "formation_id"),
        inverseJoinColumns = @JoinColumn(name = "participant_id")
    )
    private Set<Participant> participants = new HashSet<>();

    /**
     * Calcule l'état de la formation basé sur la date actuelle
     * - A_VENIR: si aujourd'hui < dateDebut
     * - EN_COURS: si dateDebut <= aujourd'hui <= dateFin
     * - TERMINEE: si aujourd'hui > dateFin
     */
    @Transient
    public FormationState getEtatCalcule() {
        LocalDate today = LocalDate.now();
        
        if (dateDebut == null || dateFin == null) {
            return FormationState.A_VENIR;
        }
        
        if (today.isBefore(dateDebut)) {
            return FormationState.A_VENIR;
        } else if (today.isAfter(dateFin)) {
            return FormationState.TERMINEE;
        } else {
            return FormationState.EN_COURS;
        }
    }

    /**
     * Calcule la durée en jours basée sur les dates
     */
    @Transient
    @JsonProperty("duree")
    public Integer getDureeCalculee() {
        if (dateDebut != null && dateFin != null) {
            return (int) java.time.temporal.ChronoUnit.DAYS.between(dateDebut, dateFin) + 1;
        }
        return 0;
    }

    /**
     * Met à jour l'état avant de persister en base de données
     */
    @PrePersist
    @PreUpdate
    private void updateState() {
        this.etat = getEtatCalcule();
    }
}