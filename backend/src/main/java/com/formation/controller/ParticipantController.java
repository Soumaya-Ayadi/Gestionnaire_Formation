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
        return participantService.getAll();
    }

    @GetMapping("/{id}")
    public Participant getById(@PathVariable Long id) {
        return participantService.getById(id);
    }

    @GetMapping("/{id}/formations")
    public List<Formation> getFormationsHistory(@PathVariable Long id) {
        return participantService.getFormationsHistory(id);
    }

    @PostMapping
    public Participant create(@Valid @RequestBody ParticipantRequest req) {
        return participantService.create(req);
    }

    @PutMapping("/{id}")
    public Participant update(@PathVariable Long id, @Valid @RequestBody ParticipantRequest req) {
        return participantService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        participantService.delete(id);
        return ResponseEntity.noContent().build();
    }
}