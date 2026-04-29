package com.formation.service;

import com.formation.dto.ParticipantRequest;
import com.formation.entity.*;
import com.formation.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final StructureRepository structureRepository;
    private final ProfilRepository profilRepository;
    private final FormationRepository formationRepository;

    public List<Participant> getAll() {
        List<Participant> participants = participantRepository.findAll();
        // Populate the transient formationCount for each participant
        // using the formation_participant join table (the authoritative source).
        participants.forEach(p ->
            p.setFormationCount(formationRepository.findByParticipantId(p.getId()).size())
        );
        return participants;
    }

    public Participant getById(Long id) {
        return participantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Participant introuvable: " + id));
    }

    public Participant create(ParticipantRequest req) {
        return participantRepository.save(buildFromRequest(new Participant(), req));
    }

    public Participant update(Long id, ParticipantRequest req) {
        Participant participant = getById(id);
        return participantRepository.save(buildFromRequest(participant, req));
    }

    @Transactional
    public void delete(Long id) {
        Participant participant = getById(id);
        List<Formation> formations = formationRepository.findByParticipantId(id);
        for (Formation formation : formations) {
            formation.getParticipants().removeIf(p -> p.getId().equals(id));
        }
        formationRepository.saveAll(formations);
        participantRepository.delete(participant);
    }

    public List<Formation> getFormationsHistory(Long participantId) {
        return formationRepository.findByParticipantId(participantId);
    }

    private Participant buildFromRequest(Participant p, ParticipantRequest req) {
        Structure structure = structureRepository.findById(req.getStructureId())
                .orElseThrow(() -> new IllegalArgumentException("Structure introuvable"));
        Profil profil = profilRepository.findById(req.getProfilId())
                .orElseThrow(() -> new IllegalArgumentException("Profil introuvable"));

        p.setNom(req.getNom());
        p.setPrenom(req.getPrenom());
        p.setEmail(req.getEmail());
        p.setTel(req.getTel());
        p.setStructure(structure);
        p.setProfil(profil);
        return p;
    }
}