package com.formation.repository;

import com.formation.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findByStructureId(Long structureId);
    List<Participant> findByProfilId(Long profilId);
}