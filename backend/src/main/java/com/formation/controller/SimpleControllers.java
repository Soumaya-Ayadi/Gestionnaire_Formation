package com.formation.controller;

import com.formation.entity.*;
import com.formation.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ---- Domaine ----
@RestController
@RequestMapping("/api/domaines")
@RequiredArgsConstructor
class DomaineController {
    private final DomaineRepository repo;

    @GetMapping  public List<Domaine> getAll() { return repo.findAll(); }
    @PostMapping public Domaine create(@Valid @RequestBody Domaine d) { return repo.save(d); }
    @PutMapping("/{id}") public Domaine update(@PathVariable Long id, @Valid @RequestBody Domaine d) {
        d.setId(id); return repo.save(d);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// ---- Profil ----
@RestController
@RequestMapping("/api/profils")
@RequiredArgsConstructor
class ProfilController {
    private final ProfilRepository repo;

    @GetMapping  public List<Profil> getAll() { return repo.findAll(); }
    @PostMapping public Profil create(@Valid @RequestBody Profil p) { return repo.save(p); }
    @PutMapping("/{id}") public Profil update(@PathVariable Long id, @Valid @RequestBody Profil p) {
        p.setId(id); return repo.save(p);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// ---- Structure ----
@RestController
@RequestMapping("/api/structures")
@RequiredArgsConstructor
class StructureController {
    private final StructureRepository repo;

    @GetMapping  public List<Structure> getAll() { return repo.findAll(); }
    @PostMapping public Structure create(@Valid @RequestBody Structure s) { return repo.save(s); }
    @PutMapping("/{id}") public Structure update(@PathVariable Long id, @Valid @RequestBody Structure s) {
        s.setId(id); return repo.save(s);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// ---- Employeur ----
@RestController
@RequestMapping("/api/employeurs")
@RequiredArgsConstructor
class EmployeurController {
    private final EmployeurRepository repo;

    @GetMapping  public List<Employeur> getAll() { return repo.findAll(); }
    @PostMapping public Employeur create(@Valid @RequestBody Employeur e) { return repo.save(e); }
    @PutMapping("/{id}") public Employeur update(@PathVariable Long id, @Valid @RequestBody Employeur e) {
        e.setId(id); return repo.save(e);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// ---- Utilisateur (admin only) ----
@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
class UtilisateurController {
    private final UtilisateurRepository repo;

    @GetMapping  public List<Utilisateur> getAll() { return repo.findAll(); }
    @GetMapping("/{id}") public Utilisateur getById(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}