package syncX.modules.CompanyAdmin.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.CompanyAdmin.job.entity.Job;

public interface JobRepository extends JpaRepository<Job, Long> {
}