package syncX.modules.SuperAdmin.Admin_dashboard.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
public class AdminDashboardRepository {

    // Inject EntityManager for executing native SQL queries
    @PersistenceContext
    private EntityManager entityManager;

    // Get total number of companies
    public long getTotalCompanies() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM companies")
                .getSingleResult()).longValue();
    }

    // Get total number of approved companies
    public long getApprovedCompanies() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM companies WHERE company_status = 'approved'")
                .getSingleResult()).longValue();
    }

    // Get total number of pending companies
    public long getPendingCompanies() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM companies WHERE company_status = 'pending'")
                .getSingleResult()).longValue();
    }

    // Get total number of jobs
    public long getTotalJobs() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM jobs")
                .getSingleResult()).longValue();
    }

    // Get total number of job applications
    public long getTotalApplications() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM job_applications")
                .getSingleResult()).longValue();
    }

    // Get total number of users
    public long getTotalUsers() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM users")
                .getSingleResult()).longValue();
    }

    // Get total number of candidate users
    public long getTotalCandidates() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM users WHERE role = 'candidate'")
                .getSingleResult()).longValue();
    }

    // Get total number of interviewer users
    public long getTotalInterviewers() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM users WHERE role = 'interviewer'")
                .getSingleResult()).longValue();
    }

    // Get total number of company admin users
    public long getTotalCompanyAdmins() {
        return ((Number) entityManager
                .createNativeQuery("SELECT COUNT(*) FROM users WHERE role = 'company_admin'")
                .getSingleResult()).longValue();
    }
}