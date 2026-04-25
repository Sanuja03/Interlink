package syncX.modules.SuperAdmin.Admin_dashboard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import syncX.modules.SuperAdmin.Admin_dashboard.dto.*;
import syncX.modules.SuperAdmin.Admin_dashboard.repository.AdminDashboardRepository;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final AdminDashboardRepository repository;

    public AdminDashboardDto getAdminDashboardData() {

        // Companies
        CompanyStatsDto companies = new CompanyStatsDto(
                repository.getTotalCompanies(),
                repository.getApprovedCompanies(),
                repository.getPendingCompanies()
        );

        // Jobs
        JobStatsDto jobs = new JobStatsDto(
                repository.getTotalJobs()
        );

        // Applications
        ApplicationStatsDto applications = new ApplicationStatsDto(
                repository.getTotalApplications()
        );

        // Users
        UserStatsDto users = new UserStatsDto(
                repository.getTotalUsers(),
                repository.getTotalCandidates(),
                repository.getTotalInterviewers(),
                repository.getTotalCompanyAdmins()
        );

        return new AdminDashboardDto(
                companies,
                jobs,
                applications,
                users
        );
    }
}