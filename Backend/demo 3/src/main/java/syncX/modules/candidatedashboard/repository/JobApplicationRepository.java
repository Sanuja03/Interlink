package syncX.modules.candidatedashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.candidatedashboard.entity.JobApplication;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByCandidateId(Long candidateId);
    long countByCandidateId(Long candidateId);
    long countByCandidateIdAndResultIgnoreCase(Long candidateId, String result);
}
