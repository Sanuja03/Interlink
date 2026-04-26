package syncX.modules.candidatedashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.candidatedashboard.entity.CandidateInterview;

import java.util.List;

@Repository
public interface CandidateInterviewRepository extends JpaRepository<CandidateInterview, Long> {
    List<CandidateInterview> findByCandidateId(Long candidateId);
    long countByCandidateId(Long candidateId);
}
