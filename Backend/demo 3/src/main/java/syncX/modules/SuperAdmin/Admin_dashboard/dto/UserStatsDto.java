package syncX.modules.SuperAdmin.Admin_dashboard.dto;

public record UserStatsDto(
        long total,
        long candidates,
        long interviewers,
        long companyAdmins
) {}