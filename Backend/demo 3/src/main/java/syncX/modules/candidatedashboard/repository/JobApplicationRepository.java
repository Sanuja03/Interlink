package syncX.modules.candidatedashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.candidatedashboard.entity.JobApplication;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    // 🔹 Get all applications for candidate
    List<JobApplication> findByCandidateId(UUID candidateId);

    // 🔹 Count by result (FIXED TYPE)
    long countByCandidateIdAndResultIgnoreCase(UUID candidateId, String result);

    // 🔹 Optional: count by status
    long countByCandidateIdAndStatusIgnoreCase(UUID candidateId, String status);
}