package com.formation.controller;

import com.formation.dto.ParticipantRequest;
import com.formation.entity.Formation;
import com.formation.entity.Participant;
import com.formation.service.ParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
@RequiredArgsConstructor
@Slf4j
public class ParticipantController {

    private final ParticipantService participantService;

    @GetMapping
    public List<Participant> getAll() {
        log.info("GET /participants - Fetching all participants");
        List<Participant> participants = participantService.getAll();
        log.info("Found {} participants", participants.size());
        return participants;
    }

    @GetMapping("/{id}")
    public Participant getById(@PathVariable Long id) {
        log.info("GET /participants/{} - Fetching participant", id);
        try {
            Participant participant = participantService.getById(id);
            log.info("Found participant: {} {}", participant.getPrenom(), participant.getNom());
            return participant;
        } catch (Exception e) {
            log.error("Participant not found: {}", id, e);
            throw e;
        }
    }

    @GetMapping("/{id}/formations")
    public List<Formation> getFormationsHistory(@PathVariable Long id) {
        log.info("GET /participants/{}/formations - Fetching formation history", id);
        try {
            List<Formation> formations = participantService.getFormationsHistory(id);
            log.info("Found {} formations for participant {}", formations.size(), id);
            return formations;
        } catch (Exception e) {
            log.error("Error fetching formation history for participant {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping
    public Participant create(@Valid @RequestBody ParticipantRequest req) {
        log.info("POST /participants - Creating participant: {} {}", req.getPrenom(), req.getNom());
        try {
            Participant participant = participantService.create(req);
            log.info("Participant created successfully: {}", participant.getId());
            return participant;
        } catch (Exception e) {
            log.error("Error creating participant: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public Participant update(@PathVariable Long id, @Valid @RequestBody ParticipantRequest req) {
        log.info("PUT /participants/{} - Updating participant", id);
        try {
            Participant participant = participantService.update(id, req);
            log.info("Participant updated successfully: {}", id);
            return participant;
        } catch (Exception e) {
            log.error("Error updating participant {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /participants/{} - Deleting participant", id);
        try {
            participantService.delete(id);
            log.info("Participant deleted successfully: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting participant {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}