package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import syncX.modules.candidatedashboard.entity.JobApplication;
import java.util.UUID;

public interface AdminCandidateStatsRepository extends JpaRepository<JobApplication, Long> {

    @Query(value = "SELECT COUNT(*) FROM job_applications WHERE candidate_id = :userId", nativeQuery = true)
    long countByCandidateId(@Param("userId") UUID userId);

    @Query(value = """
    SELECT COUNT(*)
    FROM job_applications
    WHERE candidate_id = :userId
    AND status = CAST(:status AS application_status)
    """, nativeQuery = true)
    long countByCandidateIdAndStatus(
            @Param("userId") UUID userId,
            @Param("status") String status
    );
}