package syncX.modules.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.job.entity.Job;

public interface JobRepository extends JpaRepository<Job, Long> {}