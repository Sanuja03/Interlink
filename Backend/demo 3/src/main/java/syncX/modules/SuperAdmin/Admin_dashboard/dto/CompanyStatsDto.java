package syncX.modules.SuperAdmin.Admin_dashboard.dto;

public record CompanyStatsDto(
        long total,
        long approved,
        long pending
) {}