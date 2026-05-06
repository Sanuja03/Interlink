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
                j.company AS company,
                j.logo AS logo,
                j.job_location AS location,
                j.employment_type AS employmentType,
                j.category AS category,
                j.experience_level AS experienceLevel,
                j.job_title AS title,
                j.about_company AS aboutCompany,
                j.description AS description,
                j."Deadline" AS deadline
            FROM jobs j
            ORDER BY j.id DESC
            """, nativeQuery = true)
    List<CjobpostSummaryProjection> findAllSummaries();

    @Query(value = """
            SELECT
                j.id AS id,
                j.company AS company,
                j.logo AS logo,
                j.job_location AS location,
                j.employment_type AS employmentType,
                j.category AS category,
                j.experience_level AS experienceLevel,
                j.job_title AS title,
                j.about_company AS aboutCompany,
                j.description AS description,
                j."Deadline" AS deadline
            FROM jobs j
            WHERE j.id = :id
            """, nativeQuery = true)
    Optional<CjobpostSummaryProjection> findSummaryById(@Param("id") Long id);
}
