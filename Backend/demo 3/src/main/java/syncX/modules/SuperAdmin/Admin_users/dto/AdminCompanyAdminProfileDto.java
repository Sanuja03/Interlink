package syncX.modules.SuperAdmin.Admin_users.dto;

import java.util.List;
import java.util.UUID;

public record AdminCompanyAdminProfileDto(
        UUID userId,
        String email,
        String accountStatus,
        List<AdminUsersActivityLogDto> activityLogs
) {}