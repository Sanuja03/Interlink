package syncX.modules.cjobpost.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.cjobpost.entity.JobRequirement;

@Repository("companyJobRequirementRepository")
public interface JobRequirementRepository extends JpaRepository<JobRequirement, Long> {
}