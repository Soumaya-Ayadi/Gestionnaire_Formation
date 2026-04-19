package com.formation.service;

import com.formation.dto.CreateUserRequest;
import com.formation.dto.LoginRequest;
import com.formation.dto.LoginResponse;
import com.formation.entity.Role;
import com.formation.entity.Utilisateur;
import com.formation.repository.RoleRepository;
import com.formation.repository.UtilisateurRepository;
import com.formation.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword())
        );
        User user = (User) auth.getPrincipal();
        String role = user.getAuthorities().iterator().next().getAuthority();
        String token = jwtUtils.generateToken(user.getUsername(), role);
        return new LoginResponse(token, role, user.getUsername());
    }

    /**
     * Admin creates a user account. A random password is generated and sent by email.
     */
    public Utilisateur createUserAccount(CreateUserRequest request) {
        if (utilisateurRepository.existsByLogin(request.getLogin())) {
            throw new IllegalArgumentException("Ce login existe déjà.");
        }

        Role role = roleRepository.findByNom(request.getRole())
                .orElseThrow(() -> new IllegalArgumentException("Rôle introuvable: " + request.getRole()));

        // generate a random password
        String rawPassword = UUID.randomUUID().toString().substring(0, 10);

        Utilisateur user = new Utilisateur();
        user.setLogin(request.getLogin());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(true);

        Utilisateur saved = utilisateurRepository.save(user);

        // send credentials by email
        sendCredentialsMail(request.getEmail(), request.getLogin(), rawPassword);

        return saved;
    }

    private void sendCredentialsMail(String to, String login, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Vos identifiants - Gestion Formation");
            message.setText(
                "Bonjour,\n\n" +
                "Votre compte a été créé sur l'application Gestion Formation.\n\n" +
                "Login : " + login + "\n" +
                "Mot de passe : " + password + "\n\n" +
                "Veuillez changer votre mot de passe après votre première connexion.\n\n" +
                "Cordialement,\nL'équipe Excellent Training"
            );
            mailSender.send(message);
        } catch (Exception e) {
            // mail failure shouldn't block account creation
            System.err.println("Impossible d'envoyer l'email: " + e.getMessage());
        }
    }
}