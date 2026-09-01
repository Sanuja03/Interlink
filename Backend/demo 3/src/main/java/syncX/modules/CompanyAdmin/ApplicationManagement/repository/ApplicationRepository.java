package syncX.modules.CompanyAdmin.ApplicationManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @Query(value = "SELECT * FROM job_applications WHERE \"Company_Id\" = :companyId", nativeQuery = true)
    List<Application> findByCompanyId(@Param("companyId") UUID companyId);

    @Query(value = "SELECT * FROM job_applications WHERE id = :id", nativeQuery = true)
    Optional<Application> findById(@Param("id") Long id);

    /**
     * The candidate's application for a specific job. Used as a fallback when a
     * row that references an application (e.g. interview_requests) carries a
     * job_application_id that no longer resolves, so the AI score can still be
     * located from candidate + job.
     */
    @Query(value = "SELECT * FROM job_applications " +
            "WHERE candidate_id = :candidateId AND job_id = :jobId " +
            "ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<Application> findLatestByCandidateAndJob(@Param("candidateId") UUID candidateId,
                                                      @Param("jobId") Long jobId);
}