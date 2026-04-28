package syncX.modules.jobapply.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.jobapply.entity.CandidatePreference;

import java.util.UUID;

public interface CandidatePreferenceRepository extends JpaRepository<CandidatePreference, UUID> {
}
