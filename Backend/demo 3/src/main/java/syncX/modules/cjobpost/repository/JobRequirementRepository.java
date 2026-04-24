package syncX.modules.cjobpost.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.cjobpost.entity.JobRequirement;

public interface JobRequirementRepository extends JpaRepository<JobRequirement, Long> {
}