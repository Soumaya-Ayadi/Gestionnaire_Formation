package com.formation.service;

import com.formation.dto.FormateurRequest;
import com.formation.entity.*;
import com.formation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FormateurService {

    private final FormateurRepository formateurRepository;
    private final EmployeurRepository employeurRepository;

    public List<Formateur> getAll() {
        return formateurRepository.findAll();
    }

    public Formateur getById(Long id) {
        return formateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Formateur introuvable: " + id));
    }

    public Formateur create(FormateurRequest req) {
        return formateurRepository.save(buildFromRequest(new Formateur(), req));
    }

    public Formateur update(Long id, FormateurRequest req) {
        return formateurRepository.save(buildFromRequest(getById(id), req));
    }

    public void delete(Long id) {
        formateurRepository.deleteById(id);
    }

    private Formateur buildFromRequest(Formateur f, FormateurRequest req) {
        f.setNom(req.getNom());
        f.setPrenom(req.getPrenom());
        f.setEmail(req.getEmail());
        f.setTel(req.getTel());
        f.setType(req.getType());

        if ("EXTERNE".equalsIgnoreCase(req.getType())) {
            if (req.getEmployeurId() == null) {
                throw new IllegalArgumentException("Un formateur externe doit avoir un employeur.");
            }
            Employeur employeur = employeurRepository.findById(req.getEmployeurId())
                    .orElseThrow(() -> new IllegalArgumentException("Employeur introuvable"));
            f.setEmployeur(employeur);
        } else {
            f.setEmployeur(null);
        }

        return f;
    }
}