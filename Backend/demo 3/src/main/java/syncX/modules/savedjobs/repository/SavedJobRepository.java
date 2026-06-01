package syncX.modules.savedjobs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.savedjobs.entity.SavedJob;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByCandidateIdOrderBySavedAtDesc(UUID candidateId);
    Optional<SavedJob> findByCandidateIdAndJobId(UUID candidateId, Long jobId);
    boolean existsByCandidateIdAndJobId(UUID candidateId, Long jobId);
    void deleteByCandidateIdAndJobId(UUID candidateId, Long jobId);
}
