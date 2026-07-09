package syncX.modules.CompanyAdmin.CandidateProfile.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.CandidateProfile.entity.CandidatePreference;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidatePreferenceRepository extends JpaRepository<CandidatePreference, UUID> {
    Optional<CandidatePreference> findByCandidateId(UUID candidateId);
}