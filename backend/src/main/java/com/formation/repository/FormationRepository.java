package com.formation.repository;

import com.formation.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {

    List<Formation> findByAnnee(Integer annee);

    // count formations per year
    @Query("SELECT f.annee, COUNT(f) FROM Formation f GROUP BY f.annee ORDER BY f.annee")
    List<Object[]> countByAnnee();

    // count participants per year
    @Query("SELECT f.annee, COUNT(p) FROM Formation f JOIN f.participants p GROUP BY f.annee ORDER BY f.annee")
    List<Object[]> countParticipantsByAnnee();

    // count participants per structure
    @Query("SELECT p.structure.libelle, COUNT(p) FROM Formation f JOIN f.participants p GROUP BY p.structure.libelle ORDER BY COUNT(p) DESC")
    List<Object[]> countParticipantsByStructure();

    // count participants per profil
    @Query("SELECT p.profil.libelle, COUNT(p) FROM Formation f JOIN f.participants p GROUP BY p.profil.libelle")
    List<Object[]> countParticipantsByProfil();

    // count formations per domaine
    @Query("SELECT f.domaine.libelle, COUNT(f) FROM Formation f GROUP BY f.domaine.libelle")
    List<Object[]> countByDomaine();

    // formations history for a participant
    @Query("SELECT f FROM Formation f JOIN f.participants p WHERE p.id = :participantId ORDER BY f.annee DESC")
    List<Formation> findByParticipantId(@Param("participantId") Long participantId);
}