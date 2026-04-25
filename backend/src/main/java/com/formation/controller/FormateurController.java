package com.formation.controller;

import com.formation.dto.FormateurRequest;
import com.formation.entity.Formateur;
import com.formation.service.FormateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formateurs")
@RequiredArgsConstructor
public class FormateurController {

    private final FormateurService formateurService;

    @GetMapping
    public List<Formateur> getAll() {
        System.out.println("GET /formateurs - Fetching all formateurs");
        List<Formateur> formateurs = formateurService.getAll();
        System.out.println("Found " + formateurs.size() + " formateurs");
        return formateurs;
    }

    @GetMapping("/{id}")
    public Formateur getById(@PathVariable Long id) {
        System.out.println("GET /formateurs/{id} - Fetching formateur: " + id);
        try {
            Formateur formateur = formateurService.getById(id);
            System.out.println("Found formateur: " + formateur.getPrenom() + " " + formateur.getNom());
            return formateur;
        } catch (Exception e) {
            System.err.println("Formateur not found: " + id);
            throw e;
        }
    }

    @PostMapping
    public Formateur create(@Valid @RequestBody FormateurRequest req) {
        System.out.println("POST /formateurs - Creating formateur: " + req.getPrenom() + " " + req.getNom());
        try {
            Formateur formateur = formateurService.create(req);
            System.out.println("Formateur created successfully: " + formateur.getId());
            return formateur;
        } catch (Exception e) {
            System.err.println("Error creating formateur: " + e.getMessage());
            throw e;
        }
    }

    @PutMapping("/{id}")
    public Formateur update(@PathVariable Long id, @Valid @RequestBody FormateurRequest req) {
        System.out.println("PUT /formateurs/{id} - Updating formateur: " + id);
        try {
            Formateur formateur = formateurService.update(id, req);
            System.out.println("Formateur updated successfully: " + id);
            return formateur;
        } catch (Exception e) {
            System.err.println("Error updating formateur " + id + ": " + e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        System.out.println("DELETE /formateurs/{id} - Deleting formateur: " + id);
        try {
            formateurService.delete(id);
            System.out.println("Formateur deleted successfully: " + id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting formateur " + id + ": " + e.getMessage());
            throw e;
        }
    }
}