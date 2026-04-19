package com.formation;

import com.formation.entity.Role;
import com.formation.entity.Utilisateur;
import com.formation.repository.RoleRepository;
import com.formation.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Runs once at startup to ensure the 3 roles exist
 * and that a default admin account is present.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // ensure roles exist
        seedRole("ROLE_ADMIN");
        seedRole("ROLE_USER");
        seedRole("ROLE_RESPONSABLE");

        // create default admin if none exists
        if (!utilisateurRepository.existsByLogin("admin")) {
            Role adminRole = roleRepository.findByNom("ROLE_ADMIN").orElseThrow();

            Utilisateur admin = new Utilisateur();
            admin.setLogin("admin");
            admin.setEmail("admin@formation.tn");
            admin.setPassword(passwordEncoder.encode("Admin@2025"));
            admin.setRole(adminRole);
            admin.setActive(true);

            utilisateurRepository.save(admin);
            System.out.println("==> Compte admin créé  login: admin  /  password: Admin@2025");
        }
    }

    private void seedRole(String nom) {
        if (roleRepository.findByNom(nom).isEmpty()) {
            roleRepository.save(new Role(null, nom));
        }
    }
}