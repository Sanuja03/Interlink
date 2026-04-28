package syncX.modules.candidatedashboard.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.candidatedashboard.entity.JobApplication;
import java.util.UUID;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByCandidateId(UUID candidateId);
    long countByCandidateId(UUID candidateId);
    long countByCandidateIdAndResult(UUID candidateId, String result);

    List<JobApplication> findByJobId(Long jobId);
    List<JobApplication> findByStatus(String status);
    boolean existsByCandidateIdAndJobId(UUID candidateId, Long jobId);
}
