package syncX.modules.SuperAdmin.Admin_users.dto;

import java.util.List;
import java.util.UUID;

public record AdminInterviewerProfileDto(
        UUID userId,
        String interviewerId,
        String email,
        String accountStatus,
        String about,
        String photoUrl,
        AdminInterviewerStatsDto stats,
        List<AdminInterviewerAvailabilityDayDto> weeklyAvailability,  // 7 entries Mon–Sun
        List<AdminUsersActivityLogDto> activityLogs
) {}