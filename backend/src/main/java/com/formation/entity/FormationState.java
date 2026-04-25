package com.formation.entity;

public enum FormationState {
    A_VENIR("À venir"),
    EN_COURS("En cours"),
    TERMINEE("Terminée");

    private final String displayName;

    FormationState(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}