package com.formation.controller;

import com.formation.service.StatistiqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
public class StatistiqueController {

    private final StatistiqueService statistiqueService;

    @GetMapping("/formations-par-annee")
    public List<Map<String, Object>> formationsParAnnee() {
        return statistiqueService.formationsParAnnee();
    }

    @GetMapping("/participants-par-annee")
    public List<Map<String, Object>> participantsParAnnee() {
        return statistiqueService.participantsParAnnee();
    }

    @GetMapping("/participants-par-structure")
    public List<Map<String, Object>> participantsParStructure() {
        return statistiqueService.participantsParStructure();
    }

    @GetMapping("/participants-par-profil")
    public List<Map<String, Object>> participantsParProfil() {
        return statistiqueService.participantsParProfil();
    }

    @GetMapping("/formations-par-domaine")
    public List<Map<String, Object>> formationsParDomaine() {
        return statistiqueService.formationsParDomaine();
    }

    @GetMapping("/evolution-participants")
    public List<Map<String, Object>> evolutionParticipants() {
        return statistiqueService.evolutionParticipants();
    }
}
