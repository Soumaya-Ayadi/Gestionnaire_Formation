package com.formation.controller;

import com.formation.dto.FormateurRequest;
import com.formation.entity.Formateur;
import com.formation.service.FormateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formateurs")
@RequiredArgsConstructor
@Slf4j
public class FormateurController {

    private final FormateurService formateurService;

    @GetMapping
    public List<Formateur> getAll() {
        log.info("GET /formateurs - Fetching all formateurs");
        List<Formateur> formateurs = formateurService.getAll();
        log.info("Found {} formateurs", formateurs.size());
        return formateurs;
    }

    @GetMapping("/{id}")
    public Formateur getById(@PathVariable Long id) {
        log.info("GET /formateurs/{} - Fetching formateur", id);
        try {
            Formateur formateur = formateurService.getById(id);
            log.info("Found formateur: {} {}", formateur.getPrenom(), formateur.getNom());
            return formateur;
        } catch (Exception e) {
            log.error("Formateur not found: {}", id, e);
            throw e;
        }
    }

    @PostMapping
    public Formateur create(@Valid @RequestBody FormateurRequest req) {
        log.info("POST /formateurs - Creating formateur: {} {}", req.getPrenom(), req.getNom());
        try {
            Formateur formateur = formateurService.create(req);
            log.info("Formateur created successfully: {}", formateur.getId());
            return formateur;
        } catch (Exception e) {
            log.error("Error creating formateur: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public Formateur update(@PathVariable Long id, @Valid @RequestBody FormateurRequest req) {
        log.info("PUT /formateurs/{} - Updating formateur", id);
        try {
            Formateur formateur = formateurService.update(id, req);
            log.info("Formateur updated successfully: {}", id);
            return formateur;
        } catch (Exception e) {
            log.error("Error updating formateur {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /formateurs/{} - Deleting formateur", id);
        try {
            formateurService.delete(id);
            log.info("Formateur deleted successfully: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting formateur {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}