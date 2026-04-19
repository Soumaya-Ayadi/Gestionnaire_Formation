package com.formation.service;

import com.formation.dto.FormationRequest;
import com.formation.entity.*;
import com.formation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final DomaineRepository domaineRepository;
    private final FormateurRepository formateurRepository;
    private final ParticipantRepository participantRepository;

    public List<Formation> getAll() {
        return formationRepository.findAll();
    }

    public List<Formation> getByAnnee(Integer annee) {
        return formationRepository.findByAnnee(annee);
    }

    public Formation getById(Long id) {
        return formationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Formation introuvable: " + id));
    }

    @Transactional
    public Formation create(FormationRequest req) {
        Formation formation = buildFromRequest(new Formation(), req);
        return formationRepository.save(formation);
    }

    @Transactional
    public Formation update(Long id, FormationRequest req) {
        Formation formation = getById(id);
        buildFromRequest(formation, req);
        return formationRepository.save(formation);
    }

    @Transactional
    public void addParticipants(Long formationId, Set<Long> participantIds) {
        Formation formation = getById(formationId);
        Set<Participant> toAdd = new HashSet<>(participantRepository.findAllById(participantIds));
        formation.getParticipants().addAll(toAdd);

        if (formation.getParticipants().size() < 4) {
            throw new IllegalArgumentException("Une formation doit avoir au minimum 4 participants.");
        }

        formationRepository.save(formation);
    }

    @Transactional
    public void removeParticipant(Long formationId, Long participantId) {
        Formation formation = getById(formationId);
        formation.getParticipants().removeIf(p -> p.getId().equals(participantId));
        formationRepository.save(formation);
    }

    public void delete(Long id) {
        formationRepository.deleteById(id);
    }

    // ---- helper ----

    private Formation buildFromRequest(Formation formation, FormationRequest req) {
        Domaine domaine = domaineRepository.findById(req.getDomaineId())
                .orElseThrow(() -> new IllegalArgumentException("Domaine introuvable"));

        formation.setTitre(req.getTitre());
        formation.setAnnee(req.getAnnee());
        formation.setDuree(req.getDuree());
        formation.setBudget(req.getBudget());
        formation.setLieu(req.getLieu());
        formation.setDomaine(domaine);

        if (req.getFormateurId() != null) {
            Formateur formateur = formateurRepository.findById(req.getFormateurId())
                    .orElseThrow(() -> new IllegalArgumentException("Formateur introuvable"));
            formation.setFormateur(formateur);
        }

        if (req.getParticipantIds() != null && !req.getParticipantIds().isEmpty()) {
            Set<Participant> participants = new HashSet<>(participantRepository.findAllById(req.getParticipantIds()));
            formation.setParticipants(participants);
        }

        return formation;
    }
}