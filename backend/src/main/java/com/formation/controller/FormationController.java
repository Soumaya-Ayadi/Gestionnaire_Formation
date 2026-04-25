package com.formation.controller;

import com.formation.dto.FormationRequest;
import com.formation.entity.Formation;
import com.formation.service.FormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    @GetMapping
    public List<Formation> getAll(@RequestParam(required = false) Integer annee) {
        if (annee != null) {
            System.out.println("GET /formations?annee=" + annee);
            return formationService.getByAnnee(annee);
        }
        System.out.println("GET /formations - Fetching all formations");
        List<Formation> formations = formationService.getAll();
        System.out.println("Found " + formations.size() + " formations");
        return formations;
    }

    @GetMapping("/{id}")
    public Formation getById(@PathVariable Long id) {
        System.out.println("GET /formations/{id} - Fetching formation: " + id);
        try {
            Formation formation = formationService.getById(id);
            System.out.println("Found formation: " + formation.getTitre());
            return formation;
        } catch (Exception e) {
            System.err.println("Formation not found: " + id);
            throw e;
        }
    }

    @PostMapping
    public Formation create(@Valid @RequestBody FormationRequest req) {
        System.out.println("POST /formations - Creating formation: " + req.getTitre());
        try {
            Formation formation = formationService.create(req);
            System.out.println("Formation created successfully: " + formation.getId());
            return formation;
        } catch (Exception e) {
            System.err.println("Error creating formation: " + e.getMessage());
            throw e;
        }
    }

    @PutMapping("/{id}")
    public Formation update(@PathVariable Long id, @Valid @RequestBody FormationRequest req) {
        System.out.println("PUT /formations/{id} - Updating formation: " + id);
        try {
            Formation formation = formationService.update(id, req);
            System.out.println("Formation updated successfully: " + id);
            return formation;
        } catch (Exception e) {
            System.err.println("Error updating formation " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<Void> addParticipants(@PathVariable Long id, @RequestBody Set<Long> participantIds) {
        System.out.println("POST /formations/{id}/participants - Adding " + participantIds.size() + " participants to formation " + id);
        try {
            formationService.addParticipants(id, participantIds);
            System.out.println("Participants added successfully to formation " + id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error adding participants to formation " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{formationId}/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long formationId, @PathVariable Long participantId) {
        System.out.println("DELETE /formations/{formationId}/participants/{participantId} - Removing participant " + participantId + " from formation " + formationId);
        try {
            formationService.removeParticipant(formationId, participantId);
            System.out.println("Participant removed successfully from formation " + formationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error removing participant " + participantId + " from formation " + formationId + ": " + e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        System.out.println("DELETE /formations/{id} - Deleting formation: " + id);
        try {
            formationService.delete(id);
            System.out.println("Formation deleted successfully: " + id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting formation " + id + ": " + e.getMessage());
            throw e;
        }
    }
}