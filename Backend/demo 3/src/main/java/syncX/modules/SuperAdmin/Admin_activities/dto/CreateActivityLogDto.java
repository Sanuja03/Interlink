package syncX.modules.SuperAdmin.Admin_activities.dto;

import java.util.UUID;

public record CreateActivityLogDto(
        UUID userId,
        String userRole,
        String action,
        String entityType,
        Long entityId,
        String description
) {}