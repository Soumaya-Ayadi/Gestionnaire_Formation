package com.formation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public void sendCredentials(String toEmail, String login, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Vos identifiants de connexion - Gestion Formation");
        message.setText("Bonjour,\n\nVos identifiants de connexion sont :\n\nLogin: " + login + "\nMot de passe: " + password + "\n\nCordialement,\nL'équipe Green Building IT");
        message.setFrom("greenbuildingitteam@gmail.com");

        mailSender.send(message);
    }
}