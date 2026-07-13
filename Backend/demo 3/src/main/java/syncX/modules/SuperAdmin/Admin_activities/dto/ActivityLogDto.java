package syncX.modules.SuperAdmin.Admin_activities.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityLogDto(
        Long id,
        UUID userId,
        String userRole,
        String action,
        String entityType,
        Long entityId,
        String description,
        LocalDateTime createdAt
) {}