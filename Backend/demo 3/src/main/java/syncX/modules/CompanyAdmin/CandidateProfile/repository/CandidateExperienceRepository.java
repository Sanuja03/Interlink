package syncX.modules.CompanyAdmin.CandidateProfile.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.CandidateProfile.entity.CandidateExperience;
import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateExperienceRepository extends JpaRepository<CandidateExperience, Long> {
    List<CandidateExperience> findByCandidateIdOrderByStartDateDesc(UUID candidateId);
}