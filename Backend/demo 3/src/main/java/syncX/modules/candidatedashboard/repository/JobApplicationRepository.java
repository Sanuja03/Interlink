package syncX.modules.candidatedashboard.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.candidatedashboard.dto.ApplicationTrackerDto;
import syncX.modules.candidatedashboard.entity.JobApplication;
import java.util.UUID;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByCandidateId(UUID candidateId);
    long countByCandidateId(UUID candidateId);
    long countByCandidateIdAndResult(UUID candidateId, String result);

    @Query(value = """
            SELECT COUNT(*)
            FROM job_applications
            WHERE candidate_id = :candidateId
              AND status = CAST(:status AS application_status)
            """, nativeQuery = true)
    long countByCandidateIdAndStatus(
            @Param("candidateId") UUID candidateId,
            @Param("status") String status);

    @Query("""
            SELECT new syncX.modules.candidatedashboard.dto.ApplicationTrackerDto(
                a.id,
                COALESCE(j.title, a.jobTitle),
                COALESCE(c.companyName, j.company, a.company),
                a.appliedDate,
                COALESCE(a.status, 'PENDING')
            )
            FROM JobApplication a
            LEFT JOIN a.job j
            LEFT JOIN j.companyDetails c
            WHERE a.candidateId = :candidateId
            ORDER BY a.appliedDate DESC NULLS LAST, a.id DESC
            """)
    List<ApplicationTrackerDto> findApplicationTrackerByCandidateId(@Param("candidateId") UUID candidateId);

    List<JobApplication> findByJobId(Long jobId);
    List<JobApplication> findByStatus(String status);
    boolean existsByCandidateIdAndJobId(UUID candidateId, Long jobId);
}
