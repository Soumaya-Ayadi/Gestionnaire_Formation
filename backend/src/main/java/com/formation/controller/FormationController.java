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
        if (annee != null) return formationService.getByAnnee(annee);
        return formationService.getAll();
    }

    @GetMapping("/{id}")
    public Formation getById(@PathVariable Long id) {
        return formationService.getById(id);
    }

    @PostMapping
    public Formation create(@Valid @RequestBody FormationRequest req) {
        return formationService.create(req);
    }

    @PutMapping("/{id}")
    public Formation update(@PathVariable Long id, @Valid @RequestBody FormationRequest req) {
        return formationService.update(id, req);
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<Void> addParticipants(@PathVariable Long id, @RequestBody Set<Long> participantIds) {
        formationService.addParticipants(id, participantIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{formationId}/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long formationId, @PathVariable Long participantId) {
        formationService.removeParticipant(formationId, participantId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        formationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}