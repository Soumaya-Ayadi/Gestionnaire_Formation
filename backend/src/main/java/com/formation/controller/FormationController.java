package com.formation.controller;

import com.formation.dto.FormationRequest;
import com.formation.entity.Formation;
import com.formation.service.FormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
@Slf4j
public class FormationController {

    private final FormationService formationService;

    @GetMapping
    public List<Formation> getAll(@RequestParam(required = false) Integer annee) {
        if (annee != null) {
            log.info("GET /formations?annee={}", annee);
            return formationService.getByAnnee(annee);
        }
        log.info("GET /formations - Fetching all formations");
        List<Formation> formations = formationService.getAll();
        log.info("Found {} formations", formations.size());
        return formations;
    }

    @GetMapping("/{id}")
    public Formation getById(@PathVariable Long id) {
        log.info("GET /formations/{} - Fetching formation", id);
        try {
            Formation formation = formationService.getById(id);
            log.info("Found formation: {}", formation.getTitre());
            return formation;
        } catch (Exception e) {
            log.error("Formation not found: {}", id, e);
            throw e;
        }
    }

    @PostMapping
    public Formation create(@Valid @RequestBody FormationRequest req) {
        log.info("POST /formations - Creating formation: {}", req.getTitre());
        try {
            Formation formation = formationService.create(req);
            log.info("Formation created successfully: {}", formation.getId());
            return formation;
        } catch (Exception e) {
            log.error("Error creating formation: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public Formation update(@PathVariable Long id, @Valid @RequestBody FormationRequest req) {
        log.info("PUT /formations/{} - Updating formation", id);
        try {
            Formation formation = formationService.update(id, req);
            log.info("Formation updated successfully: {}", id);
            return formation;
        } catch (Exception e) {
            log.error("Error updating formation {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<Void> addParticipants(@PathVariable Long id, @RequestBody Set<Long> participantIds) {
        log.info("POST /formations/{}/participants - Adding {} participants to formation", id, participantIds.size());
        try {
            formationService.addParticipants(id, participantIds);
            log.info("Participants added successfully to formation {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error adding participants to formation {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{formationId}/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long formationId, @PathVariable Long participantId) {
        log.info("DELETE /formations/{}/participants/{} - Removing participant from formation", formationId, participantId);
        try {
            formationService.removeParticipant(formationId, participantId);
            log.info("Participant removed successfully from formation {}", formationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error removing participant {} from formation {}: {}", participantId, formationId, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /formations/{} - Deleting formation", id);
        try {
            formationService.delete(id);
            log.info("Formation deleted successfully: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting formation {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}