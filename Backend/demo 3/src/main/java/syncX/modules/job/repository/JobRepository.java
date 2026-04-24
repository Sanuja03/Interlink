package syncX.modules.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.job.entity.Job;

import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, Long> {
    long countByCompanyIdAndStatus(UUID companyId, String status);
}