package syncX.modules.CompanyAdmin.Dashboard.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    public DashboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

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
        String sql = "SELECT COUNT(*) FROM shortlisted_candidates WHERE company_id = ? AND status = 'SHORTLISTED'";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, companyId);
        return count != null ? count : 0;
    }

    public long countUpcomingInterviewsByCompany(UUID companyId) {
        String sql = "SELECT COUNT(*) FROM interview_scheduled WHERE company_id = ? AND interview_date >= CURRENT_DATE AND status = 'scheduled'";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, companyId);
        return count != null ? count : 0;
    }
}