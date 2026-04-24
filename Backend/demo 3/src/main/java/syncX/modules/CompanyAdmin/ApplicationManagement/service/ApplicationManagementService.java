package syncX.modules.CompanyAdmin.ApplicationManagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationManagementRepository;
import syncX.modules.candidatedashboard.entity.JobApplication;

import java.util.*;

@Service
public class ApplicationManagementService {

    @Autowired
    private ApplicationManagementRepository repo;

    /**
     * 🔹 Get all applications
     */
    public List<JobApplication> getApplications(String companyId) {
        return repo.getApplicationsByCompanyId(companyId);
    }

    /**
     * 🔹 Get summary
     */
    public Map<String, Long> getSummary(String companyId) {

        Map<String, Long> summary = new HashMap<>();

        long total = repo.countTotalByCompany(companyId);

        long shortlisted = repo.countByCompanyAndStatus(companyId, "Shortlisted");
        long rejected = repo.countByCompanyAndStatus(companyId, "Rejected");

        long applied = repo.countByCompanyAndStatus(companyId, "Applied");
        long underReviewStatus = repo.countByCompanyAndStatus(companyId, "Under Review");

        long underReview = applied + underReviewStatus;

        summary.put("total", total);
        summary.put("underReview", underReview);
        summary.put("shortlisted", shortlisted);
        summary.put("rejected", rejected);

        return summary;
    }

    /**
     * 🔹 Update application status (ONLY reject improved)
     */
    public void updateStatus(Long id, String status) {

        JobApplication app = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        if (status != null) {
            status = status.trim();
        }

        // 🔥 ONLY REJECT PART UPDATED
        if ("Rejected".equals(status)) {

            // ❌ Prevent duplicate reject
            if ("Rejected".equals(app.getStatus())) {
                throw new RuntimeException("Application already rejected");
            }

            app.setStatus("Rejected");

            // ✅ Optional (if field exists in entity)
            try {
                app.setResult("Rejected");
            } catch (Exception ignored) {}

        } else {
            // keep other logic same
            app.setStatus(status);
        }

        repo.save(app);
    }
}