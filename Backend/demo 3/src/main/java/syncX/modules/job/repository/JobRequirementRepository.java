package syncX.modules.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.job.entity.JobRequirement;

public interface JobRequirementRepository extends JpaRepository<JobRequirement, Long> {}
