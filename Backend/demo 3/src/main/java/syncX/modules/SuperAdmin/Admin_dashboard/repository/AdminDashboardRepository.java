package syncX.modules.SuperAdmin.Admin_dashboard.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
public class AdminDashboardRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public long getTotalCompanies() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM companies")
                .getSingleResult()).longValue();
    }

    public long getApprovedCompanies() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM companies WHERE company_status = 'approved'") /**/
                .getSingleResult()).longValue();
    }

    public long getPendingCompanies() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM companies WHERE company_status = 'pending'") /**/
                .getSingleResult()).longValue();
    }

    public long getTotalJobs() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM jobs")
                .getSingleResult()).longValue();
    }

    public long getTotalApplications() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM job_applications")
                .getSingleResult()).longValue();
    }

    public long getTotalUsers() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM users")
                .getSingleResult()).longValue();
    }

    public long getTotalCandidates() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM users WHERE role = 'candidate'")
                .getSingleResult()).longValue();
    }

    public long getTotalInterviewers() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM users WHERE role = 'interviewer'")
                .getSingleResult()).longValue();
    }

    public long getTotalCompanyAdmins() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM users WHERE role = 'company_admin'")
                .getSingleResult()).longValue();
    }

}