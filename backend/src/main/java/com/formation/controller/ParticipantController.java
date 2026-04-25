package com.formation.controller;

import com.formation.dto.ParticipantRequest;
import com.formation.entity.Formation;
import com.formation.entity.Participant;
import com.formation.service.ParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @GetMapping
    public List<Participant> getAll() {
        System.out.println("GET /participants - Fetching all participants");
        List<Participant> participants = participantService.getAll();
        System.out.println("Found " + participants.size() + " participants");
        return participants;
    }

    @GetMapping("/{id}")
    public Participant getById(@PathVariable Long id) {
        System.out.println("GET /participants/{id} - Fetching participant: " + id);
        try {
            Participant participant = participantService.getById(id);
            System.out.println("Found participant: " + participant.getPrenom() + " " + participant.getNom());
            return participant;
        } catch (Exception e) {
            System.err.println("Participant not found: " + id);
            throw e;
        }
    }

    @GetMapping("/{id}/formations")
    public List<Formation> getFormationsHistory(@PathVariable Long id) {
        System.out.println("GET /participants/{id}/formations - Fetching formation history: " + id);
        try {
            List<Formation> formations = participantService.getFormationsHistory(id);
            System.out.println("Found " + formations.size() + " formations for participant " + id);
            return formations;
        } catch (Exception e) {
            System.err.println("Error fetching formation history for participant " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @PostMapping
    public Participant create(@Valid @RequestBody ParticipantRequest req) {
        System.out.println("POST /participants - Creating participant: " + req.getPrenom() + " " + req.getNom());
        try {
            Participant participant = participantService.create(req);
            System.out.println("Participant created successfully: " + participant.getId());
            return participant;
        } catch (Exception e) {
            System.err.println("Error creating participant: " + e.getMessage());
            throw e;
        }
    }

    @PutMapping("/{id}")
    public Participant update(@PathVariable Long id, @Valid @RequestBody ParticipantRequest req) {
        System.out.println("PUT /participants/{id} - Updating participant: " + id);
        try {
            Participant participant = participantService.update(id, req);
            System.out.println("Participant updated successfully: " + id);
            return participant;
        } catch (Exception e) {
            System.err.println("Error updating participant " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        System.out.println("DELETE /participants/{id} - Deleting participant: " + id);
        try {
            participantService.delete(id);
            System.out.println("Participant deleted successfully: " + id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting participant " + id + ": " + e.getMessage());
            throw e;
        }
    }
}