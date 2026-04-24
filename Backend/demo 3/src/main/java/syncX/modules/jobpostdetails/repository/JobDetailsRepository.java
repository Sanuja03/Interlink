package syncX.modules.jobpostdetails.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.jobpostdetails.entity.JobDetails;

@Repository
public interface JobDetailsRepository extends JpaRepository<JobDetails, Long> {
}
