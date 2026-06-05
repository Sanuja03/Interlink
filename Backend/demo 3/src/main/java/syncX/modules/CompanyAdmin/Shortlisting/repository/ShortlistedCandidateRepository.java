package syncX.modules.CompanyAdmin.Shortlisting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.Shortlisting.entity.ShortlistedCandidate;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShortlistedCandidateRepository extends JpaRepository<ShortlistedCandidate, Long> {

    @Query(value = "SELECT * FROM shortlisted_candidates WHERE company_id = :companyId ORDER BY id ASC", nativeQuery = true)
    List<ShortlistedCandidate> findByCompanyIdOrderByIdAsc(@Param("companyId") UUID companyId);

    @Query(value = "SELECT * FROM shortlisted_candidates WHERE company_id = :companyId AND job_application_id IN (SELECT id FROM job_applications WHERE job_id = :jobId)", nativeQuery = true)
    List<ShortlistedCandidate> findByCompanyIdAndJobId(@Param("companyId") UUID companyId, @Param("jobId") Long jobId);

    @Query(value = "SELECT COUNT(*) > 0 FROM shortlisted_candidates WHERE candidate_id = :candidateId AND job_application_id = :jobApplicationId AND company_id = :companyId", nativeQuery = true)
    boolean existsByCandidateIdAndJobApplicationIdAndCompanyId(@Param("candidateId") UUID candidateId, @Param("jobApplicationId") Long jobApplicationId, @Param("companyId") UUID companyId);
}