package syncX.modules.cjobpost.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.cjobpost.dto.CjobpostSummaryProjection;
import syncX.modules.cjobpost.entity.Cjobpost;

import java.util.List;
import java.util.Optional;

@Repository
public interface CjobpostRepository extends JpaRepository<Cjobpost, Long> {

    @Query(value = """
            SELECT
                j.id AS id,
                COALESCE(cd.company_name, c.company_name, j.company) AS company,
                COALESCE(cd.logo_url, j.logo) AS logo,
                j.job_location AS location,
                j.employment_type AS employmentType,
                j.category AS category,
                j.experience_level AS experienceLevel,
                j.job_title AS title,
                COALESCE(cd.about, j.about_company) AS aboutCompany,
                j.description AS description,
                j.deadline AS deadline,
                j.company_id AS companyId
            FROM jobs j
            LEFT JOIN company_details cd ON cd.company_id = j.company_id
            LEFT JOIN companies c ON c.company_id = j.company_id
            ORDER BY j.id DESC
            """, nativeQuery = true)
    List<CjobpostSummaryProjection> findAllSummaries();

    @Query(value = """
            SELECT
                j.id AS id,
                COALESCE(cd.company_name, c.company_name, j.company) AS company,
                COALESCE(cd.logo_url, j.logo) AS logo,
                j.job_location AS location,
                j.employment_type AS employmentType,
                j.category AS category,
                j.experience_level AS experienceLevel,
                j.job_title AS title,
                COALESCE(cd.about, j.about_company) AS aboutCompany,
                j.description AS description,
                j.deadline AS deadline,
                j.company_id AS companyId
            FROM jobs j
            LEFT JOIN company_details cd ON cd.company_id = j.company_id
            LEFT JOIN companies c ON c.company_id = j.company_id
            WHERE j.id = :id
            """, nativeQuery = true)
    Optional<CjobpostSummaryProjection> findSummaryById(@Param("id") Long id);
}
