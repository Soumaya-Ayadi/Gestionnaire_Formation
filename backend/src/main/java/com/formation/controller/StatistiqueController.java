package com.formation.controller;

import com.formation.service.StatistiqueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
@Slf4j
public class StatistiqueController {

    private final StatistiqueService statistiqueService;

    @GetMapping("/formations-par-annee")
    public List<Map<String, Object>> formationsParAnnee() {
        log.info("GET /statistiques/formations-par-annee");
        return statistiqueService.formationsParAnnee();
    }

    @GetMapping("/participants-par-annee")
    public List<Map<String, Object>> participantsParAnnee() {
        log.info("GET /statistiques/participants-par-annee");
        return statistiqueService.participantsParAnnee();
    }

    @GetMapping("/participants-par-structure")
    public List<Map<String, Object>> participantsParStructure() {
        log.info("GET /statistiques/participants-par-structure");
        return statistiqueService.participantsParStructure();
    }

    @GetMapping("/participants-par-profil")
    public List<Map<String, Object>> participantsParProfil() {
        log.info("GET /statistiques/participants-par-profil");
        return statistiqueService.participantsParProfil();
    }

    @GetMapping("/formations-par-domaine")
    public List<Map<String, Object>> formationsParDomaine() {
        log.info("GET /statistiques/formations-par-domaine");
        return statistiqueService.formationsParDomaine();
    }

    @GetMapping("/evolution-participants")
    public List<Map<String, Object>> evolutionParticipants() {
        log.info("GET /statistiques/evolution-participants");
        return statistiqueService.evolutionParticipants();
    }
}
