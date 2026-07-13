package syncX.modules.SuperAdmin.Admin_dashboard.dto;

public record AdminDashboardDto(
        CompanyStatsDto companies,
        JobStatsDto jobs,
        ApplicationStatsDto applications,
        UserStatsDto users
) {}