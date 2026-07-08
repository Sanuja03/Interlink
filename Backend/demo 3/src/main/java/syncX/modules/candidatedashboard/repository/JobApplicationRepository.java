package syncX.modules.candidatedashboard.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.candidatedashboard.entity.JobApplication;
import java.util.UUID;
import java.util.List;
import java.util.Map;

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

    @Query(value = """
            SELECT
                a.id,
                a.job_id                                   AS jobId,
                COALESCE(j.job_title, a.job_title)        AS jobTitle,
                COALESCE(c.company_name, j.company, a.company) AS company,
                a.applied_date                             AS appliedDate,
                COALESCE(a.shortlisted_date, CAST(ir.created_at AS date)) AS shortlistedDate,
                ir.interview_date                          AS interviewDate,
                COALESCE(a.status::text, 'PENDING')        AS status,
                j.deadline                                 AS deadline,
                EXISTS (
                    SELECT 1 FROM ai_question_scores aqs
                    WHERE aqs.candidate_id = a.candidate_id AND aqs.job_id = a.job_id
                )                                          AS quizAttempted
            FROM job_applications a
            LEFT JOIN jobs j         ON j.id         = a.job_id
            LEFT JOIN companies c    ON c.company_id = a."Company_Id"
            LEFT JOIN (
                SELECT DISTINCT ON (job_application_id)
                       job_application_id, interview_date, created_at
                FROM   interview_requests
                WHERE  status <> 'cancelled'
                ORDER  BY job_application_id, created_at DESC
            ) ir ON ir.job_application_id = a.id
            WHERE a.candidate_id = :candidateId
            ORDER BY a.applied_date DESC NULLS LAST, a.id DESC
            """, nativeQuery = true)
    List<Map<String, Object>> findApplicationTrackerByCandidateId(@Param("candidateId") UUID candidateId);

    List<JobApplication> findByJobId(Long jobId);
    List<JobApplication> findByStatus(String status);
    boolean existsByCandidateIdAndJobId(UUID candidateId, Long jobId);
}
