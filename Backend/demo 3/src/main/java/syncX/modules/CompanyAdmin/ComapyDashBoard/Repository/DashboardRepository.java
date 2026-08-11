package syncX.modules.CompanyAdmin.ComapyDashBoard.Repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    public DashboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    // Returns job post application shortlist interview
    public long countJobsByCompany(UUID companyId) {
        String sql = "SELECT COUNT(*) FROM jobs WHERE company_id = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, companyId);
        return count != null ? count : 0;
    }

    public long countApplicationsByCompany(UUID companyId) {
        String sql = "SELECT COUNT(*) FROM job_applications WHERE \"Company_Id\" = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, companyId);
        return count != null ? count : 0;
    }

    public long countShortlistedByCompany(UUID companyId) {
        // Mirrors the Application Management page's "Shortlisted" stat, which is
        // derived from job_applications.status (not the shortlisted_candidates
        // table, which can hold multiple rows per candidate/application and
        // therefore over-counts). A row counts as "Shortlisted" here only if:
        //   - its status is SHORTLISTED or ACCEPTED
        //   - it hasn't been rejected
        //   - it hasn't already progressed to an active interview
        //     (Application Management re-labels those as "Interview")
        String sql =
                "SELECT COUNT(*) " +
                        "FROM job_applications ja " +
                        "WHERE ja.\"Company_Id\" = ? " +
                        "  AND UPPER(COALESCE(ja.status::text, '')) IN ('SHORTLISTED', 'ACCEPTED') " +
                        "  AND UPPER(COALESCE(ja.status::text, '')) <> 'REJECTED' " +
                        "  AND NOT EXISTS ( " +
                        "        SELECT 1 FROM interview_requests ir " +
                        "        WHERE ir.job_application_id = ja.id " +
                        "          AND ir.status IN ('pending', 'finalized') " +
                        "  )";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, companyId);
        return count != null ? count : 0;
    }

    public long countUpcomingInterviewsByCompany(UUID companyId) {
        String sql = "SELECT COUNT(*) FROM interview_scheduled WHERE company_id = ? AND interview_date >= CURRENT_DATE AND status = 'scheduled'";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, companyId);
        return count != null ? count : 0;
    }
}