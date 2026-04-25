package syncX.modules.SuperAdmin.Admin_users.dto;

import java.util.UUID;

public record AdminUsersListDto(
        UUID userId,
        String name,
        String email,
        String role,
        String accountStatus
) {}