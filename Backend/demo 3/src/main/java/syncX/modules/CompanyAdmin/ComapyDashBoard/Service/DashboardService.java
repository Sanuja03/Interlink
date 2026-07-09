package syncX.modules.CompanyAdmin.Dashboard.service;

import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.Dashboard.dto.DashboardStatsDTO;
import syncX.modules.CompanyAdmin.Dashboard.repository.DashboardRepository;

import java.util.UUID;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public DashboardStatsDTO getDashboardStats(UUID companyId) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalJobPosts(dashboardRepository.countJobsByCompany(companyId));
        stats.setTotalApplications(dashboardRepository.countApplicationsByCompany(companyId));
        stats.setShortlistedCandidates(dashboardRepository.countShortlistedByCompany(companyId));
        stats.setUpcomingInterviews(dashboardRepository.countUpcomingInterviewsByCompany(companyId));
        return stats;
    }
}