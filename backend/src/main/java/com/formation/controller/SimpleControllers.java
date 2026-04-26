package com.formation.controller;

import com.formation.entity.*;
import com.formation.repository.*;
import com.formation.service.MailService;
import com.formation.service.PasswordGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ---- Domaine ----
@RestController
@RequestMapping("/api/domaines")
@RequiredArgsConstructor
@Slf4j
class DomaineController {
    private final DomaineRepository repo;

    @GetMapping  public List<Domaine> getAll() { log.info("GET /domaines"); return repo.findAll(); }
    @PostMapping public Domaine create(@Valid @RequestBody Domaine d) { log.info("POST /domaines - Creating domaine: {}", d.getLibelle()); return repo.save(d); }
    @PutMapping("/{id}") public Domaine update(@PathVariable Long id, @Valid @RequestBody Domaine d) {
        log.info("PUT /domaines/{} - Updating domaine", id); d.setId(id); return repo.save(d);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /domaines/{} - Deleting domaine", id); repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// ---- Profil ----
@RestController
@RequestMapping("/api/profils")
@RequiredArgsConstructor
@Slf4j
class ProfilController {
    private final ProfilRepository repo;

    @GetMapping  public List<Profil> getAll() { log.info("GET /profils"); return repo.findAll(); }
    @PostMapping public Profil create(@Valid @RequestBody Profil p) { log.info("POST /profils - Creating profil: {}", p.getLibelle()); return repo.save(p); }
    @PutMapping("/{id}") public Profil update(@PathVariable Long id, @Valid @RequestBody Profil p) {
        log.info("PUT /profils/{} - Updating profil", id); p.setId(id); return repo.save(p);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /profils/{} - Deleting profil", id); repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// ---- Structure ----
@RestController
@RequestMapping("/api/structures")
@RequiredArgsConstructor
@Slf4j
class StructureController {
    private final StructureRepository repo;

    @GetMapping  public List<Structure> getAll() { log.info("GET /structures"); return repo.findAll(); }
    @PostMapping public Structure create(@Valid @RequestBody Structure s) { log.info("POST /structures - Creating structure: {}", s.getLibelle()); return repo.save(s); }
    @PutMapping("/{id}") public Structure update(@PathVariable Long id, @Valid @RequestBody Structure s) {
        log.info("PUT /structures/{} - Updating structure", id); s.setId(id); return repo.save(s);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /structures/{} - Deleting structure", id); repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// ---- Employeur ----
@RestController
@RequestMapping("/api/employeurs")
@RequiredArgsConstructor
@Slf4j
class EmployeurController {
    private final EmployeurRepository repo;

    @GetMapping  public List<Employeur> getAll() { log.info("GET /employeurs"); return repo.findAll(); }
    @PostMapping public Employeur create(@Valid @RequestBody Employeur e) { log.info("POST /employeurs - Creating employeur: {}", e.getNomEmployeur()); return repo.save(e); }
    @PutMapping("/{id}") public Employeur update(@PathVariable Long id, @Valid @RequestBody Employeur e) {
        log.info("PUT /employeurs/{} - Updating employeur", id); e.setId(id); return repo.save(e);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /employeurs/{} - Deleting employeur", id); repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// ---- Utilisateur (admin only) ----
@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
class UtilisateurController {
    private final UtilisateurRepository repo;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final PasswordGeneratorService passwordGenerator;

    @GetMapping
    public List<Utilisateur> getAll() {
        System.out.println("GET /utilisateurs - Fetching all users");
        List<Utilisateur> users = repo.findAll();
        System.out.println("Found " + users.size() + " users");
        return users;
    }

    @GetMapping("/{id}")
    public Utilisateur getById(@PathVariable Long id) {
        System.out.println("GET /utilisateurs/{} - Fetching user with id: {}" + id);
        Utilisateur user = repo.findById(id).orElseThrow(() -> {
            System.err.println("User not found: " + id);
            return new IllegalArgumentException("Utilisateur introuvable");
        });
        System.out.println("Found user: " + user.getLogin());
        return user;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Object create(@Valid @RequestBody Utilisateur user) {
        System.out.println("POST /utilisateurs - Creating new user: login=" + user.getLogin() + ", email=" + user.getEmail() + ", role=" + (user.getRole() != null ? user.getRole().getNom() : "null"));
        try {
            // Generate strong password
            String generatedPassword = passwordGenerator.generateStrongPassword();
            System.out.println("Generated password for " + user.getLogin() + ": " + generatedPassword);
            user.setPassword(passwordEncoder.encode(generatedPassword));

            // Ensure role is set, default to USER
            if (user.getRole() == null || user.getRole().getNom() == null) {
                System.out.println("Role is null, setting to ROLE_USER");
                Role userRole = roleRepository.findByNom("ROLE_USER").orElseThrow();
                user.setRole(userRole);
            } else {
                // Validate the role exists
                System.out.println("Validating role: " + user.getRole().getNom());
                Role role = roleRepository.findByNom(user.getRole().getNom()).orElseThrow(() -> new IllegalArgumentException("Rôle invalide"));
                user.setRole(role);
            }
            user.setActive(true);

            Utilisateur saved = repo.save(user);
            System.out.println("User created successfully: " + saved.getLogin() + " with role " + saved.getRole().getNom());

            // Send email with credentials
            try {
                mailService.sendCredentials(user.getEmail(), user.getLogin(), generatedPassword);
                System.out.println("Email sent successfully to: " + user.getEmail());
            } catch (Exception e) {
                System.err.println("Failed to send email to " + user.getEmail() + ": " + e.getMessage());
                // Don't fail the user creation
            }

            // Return response with password (for display only, one-time)
            com.formation.dto.UtilisateurResponse response = new com.formation.dto.UtilisateurResponse(
                saved.getId(),
                saved.getLogin(),
                saved.getEmail(),
                saved.getRole().getNom(),
                saved.isActive(),
                generatedPassword
            );
            System.out.println("Returning user creation response");
            return response;
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        System.out.println("DELETE /utilisateurs/{} - Deleting user with id: {}" + id);
        try {
            repo.deleteById(id);
            System.out.println("User deleted successfully: " + id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting user " + id + ": " + e.getMessage());
            throw e;
        }
    }
}