package syncX.modules.SuperAdmin.Admin_jobs.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import syncX.modules.SuperAdmin.Admin_jobs.entity.AdminJob;

import java.util.List;

public interface AdminJobRepository extends JpaRepository<AdminJob, Long> {

    @Query(value = """
        SELECT
            j.id,
            j.job_title,
            j.job_location,
            j.employment_type,
            j.category,
            j.status,
            j.created_at,
            j.company_id,
            COALESCE(c.company_name, 'Unknown Company') AS company_name
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.company_id
        WHERE (:search   = '' OR LOWER(j.job_title) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status   = '' OR LOWER(j.status) = LOWER(:status))
          AND (:type     = '' OR LOWER(j.employment_type) = LOWER(:type))
          AND (:category = '' OR LOWER(j.category) = LOWER(:category))
        ORDER BY j.created_at DESC
    """,
            countQuery = """
        SELECT COUNT(*)
        FROM jobs j
        WHERE (:search   = '' OR LOWER(j.job_title) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status   = '' OR LOWER(j.status) = LOWER(:status))
          AND (:type     = '' OR LOWER(j.employment_type) = LOWER(:type))
          AND (:category = '' OR LOWER(j.category) = LOWER(:category))
    """,
            nativeQuery = true)
    Page<Object[]> searchJobsWithCompany(
            @Param("search")   String search,
            @Param("status")   String status,
            @Param("type")     String type,
            @Param("category") String category,
            Pageable pageable
    );

    /**
     * Details — single job + company name by id.
     */
    @Query(value = """
        SELECT
            j.id,
            j.job_title,
            j.job_location,
            j.employment_type,
            j.category,
            j.status,
            j.created_at,
            j.company_id,
            COALESCE(c.company_name, 'Unknown Company') AS company_name
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.company_id
        WHERE j.id = :id
    """, nativeQuery = true)
    List<Object[]> findJobWithCompany(@Param("id") Long id);

    @Query(value = """
        SELECT COUNT(*) FROM job_applications
        WHERE job_id = :jobId
    """, nativeQuery = true)
    long countApplications(@Param("jobId") Long jobId);
}