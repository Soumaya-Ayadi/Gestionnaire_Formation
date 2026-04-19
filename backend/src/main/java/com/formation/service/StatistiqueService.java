package com.formation.service;

import com.formation.repository.FormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StatistiqueService {

    private final FormationRepository formationRepository;

    /** Number of formations per year */
    public List<Map<String, Object>> formationsParAnnee() {
        return toMapList(formationRepository.countByAnnee(), "annee", "count");
    }

    /** Number of participants per year */
    public List<Map<String, Object>> participantsParAnnee() {
        return toMapList(formationRepository.countParticipantsByAnnee(), "annee", "count");
    }

    /** Number of participants per structure */
    public List<Map<String, Object>> participantsParStructure() {
        return toMapList(formationRepository.countParticipantsByStructure(), "structure", "count");
    }

    /** Number of participants per profil */
    public List<Map<String, Object>> participantsParProfil() {
        return toMapList(formationRepository.countParticipantsByProfil(), "profil", "count");
    }

    /** Number of formations per domaine */
    public List<Map<String, Object>> formationsParDomaine() {
        return toMapList(formationRepository.countByDomaine(), "domaine", "count");
    }

    /** Evolution: % change of participants year-over-year */
    public List<Map<String, Object>> evolutionParticipants() {
        List<Object[]> raw = formationRepository.countParticipantsByAnnee();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < raw.size(); i++) {
            Object[] row = raw.get(i);
            Map<String, Object> entry = new LinkedHashMap<>();
            int annee = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            entry.put("annee", annee);
            entry.put("count", count);

            if (i > 0) {
                Object[] previous = raw.get(i - 1);
                long prev = ((Number) previous[1]).longValue();
                double pct = prev == 0 ? 0 : ((double) (count - prev) / prev) * 100;
                entry.put("evolution", Math.round(pct * 10.0) / 10.0);
            } else {
                entry.put("evolution", null);
            }

            result.add(entry);
        }

        return result;
    }

    // ---- helper ----

    private List<Map<String, Object>> toMapList(List<Object[]> rows, String key1, String key2) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put(key1, row[0]);
            map.put(key2, row[1]);
            list.add(map);
        }
        return list;
    }
}