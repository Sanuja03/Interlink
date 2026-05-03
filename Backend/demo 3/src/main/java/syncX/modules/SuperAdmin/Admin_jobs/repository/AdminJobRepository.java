package syncX.modules.SuperAdmin.Admin_jobs.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import syncX.modules.SuperAdmin.Admin_jobs.entity.AdminJob;

import java.util.List;

public interface AdminJobRepository extends JpaRepository<AdminJob, Long> {

    // Custom query to fetch jobs with company name and filters with pagination
    @Query(
            value = """
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
            nativeQuery = true
    )
    Page<Object[]> searchJobsWithCompany(
            @Param("search") String search,       // Search keyword for job title
            @Param("status") String status,       // Filter by job status
            @Param("type") String type,           // Filter by employment type
            @Param("category") String category,   // Filter by job category
            Pageable pageable                    // Pagination details
    );

    // Fetch a single job with company name by job ID
    @Query(
            value = """
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
        """,
            nativeQuery = true
    )
    List<Object[]> findJobWithCompany(@Param("id") Long id); // Returns raw result array

    // Count number of applications for a specific job
    @Query(
            value = """
            SELECT COUNT(*) FROM job_applications
            WHERE job_id = :jobId
        """,
            nativeQuery = true
    )
    long countApplications(@Param("jobId") Long jobId); // Application count for job
}