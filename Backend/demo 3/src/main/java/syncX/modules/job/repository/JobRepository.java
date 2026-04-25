package syncX.modules.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.job.entity.Job;

import java.util.List;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, Long> {

    // Get all jobs by company (latest first)
    List<Job> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    // Optional: filter by status
    List<Job> findByCompanyIdAndStatus(UUID companyId, String status);

    // Required
    List<Job> findByCompanyId(UUID companyId);
}