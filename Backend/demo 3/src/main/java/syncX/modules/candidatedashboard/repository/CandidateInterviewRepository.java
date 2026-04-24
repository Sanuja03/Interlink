package syncX.modules.candidatedashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.candidatedashboard.entity.CandidateInterview;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateInterviewRepository extends JpaRepository<CandidateInterview, Long> {
    List<CandidateInterview> findByCandidateId(UUID candidateId);
    long countByCandidateId(UUID candidateId);
}
