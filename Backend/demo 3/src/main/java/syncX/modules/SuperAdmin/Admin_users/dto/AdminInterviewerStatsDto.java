package syncX.modules.SuperAdmin.Admin_users.dto;

public record AdminInterviewerStatsDto(
        long totalInterviews,
        long pendingRequests,
        long responseRate
) {}