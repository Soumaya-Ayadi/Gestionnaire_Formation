package com.formation;

import com.formation.entity.Role;
import com.formation.entity.Utilisateur;
import com.formation.repository.RoleRepository;
import com.formation.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.core.env.Environment;

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
    private final Environment env;

    @Override
    public void run(String... args) {
        try {
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
                admin.setPassword(passwordEncoder.encode(env.getProperty("ADMIN_PASSWORD", "Admin@2025")));
                admin.setRole(adminRole);
                admin.setActive(true);

                utilisateurRepository.save(admin);
                System.out.println("==> Compte admin créé  login: admin  /  password: " + env.getProperty("ADMIN_PASSWORD", "Admin@2025"));
            }

            // create default responsable if none exists
            if (!utilisateurRepository.existsByLogin("responsable")) {
                Role respRole = roleRepository.findByNom("ROLE_RESPONSABLE").orElseThrow();

                Utilisateur resp = new Utilisateur();
                resp.setLogin("responsable");
                resp.setEmail("resp@formation.tn");
                resp.setPassword(passwordEncoder.encode(env.getProperty("RESP_PASSWORD", "Resp@2025")));
                resp.setRole(respRole);
                resp.setActive(true);

                utilisateurRepository.save(resp);
                System.out.println("==> Compte responsable créé  login: responsable  /  password: " + env.getProperty("RESP_PASSWORD", "Resp@2025"));
            }
        } catch (Exception e) {
            System.err.println("Error in DataInitializer: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void seedRole(String nom) {
        if (roleRepository.findByNom(nom).isEmpty()) {
            roleRepository.save(new Role(null, nom));
        }
    }
}