package syncX.modules.CompanyAdmin.CandidateProfile.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.CandidateProfile.entity.CandidateEducation;
import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateEducationRepository extends JpaRepository<CandidateEducation, Long> {
    List<CandidateEducation> findByCandidateId(UUID candidateId);
}