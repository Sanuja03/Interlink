package syncX.modules.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.job.entity.JobRequirement;

import java.util.List;

public interface JobRequirementRepository extends JpaRepository<JobRequirement, Long> {
    List<JobRequirement> findByJobId(Long jobId);
}

