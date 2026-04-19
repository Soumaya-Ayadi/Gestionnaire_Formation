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
        return formateurService.getAll();
    }

    @GetMapping("/{id}")
    public Formateur getById(@PathVariable Long id) {
        return formateurService.getById(id);
    }

    @PostMapping
    public Formateur create(@Valid @RequestBody FormateurRequest req) {
        return formateurService.create(req);
    }

    @PutMapping("/{id}")
    public Formateur update(@PathVariable Long id, @Valid @RequestBody FormateurRequest req) {
        return formateurService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        formateurService.delete(id);
        return ResponseEntity.noContent().build();
    }
}