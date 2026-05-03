package syncX.modules.SuperAdmin.Admin_users.dto;

import java.util.List;
import java.util.UUID;

public record AdminCandidateProfileDto(
        UUID userId,
        String name,
        String email,
        String accountStatus,
        String location,
        String workMode,
        String dob,
        AdminUserStatsDto stats,
        List<String> skills,
        List<AdminUsersActivityLogDto> activityLogs
) {}