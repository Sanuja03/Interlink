package syncX.modules.SuperAdmin.Admin_users.dto;

import java.time.LocalDateTime;

public class AdminUsersActivityLogDto {

    private String action;
    private String description;
    private LocalDateTime createdAt;

    public AdminUsersActivityLogDto(String action, String description, LocalDateTime createdAt) {
        this.action = action;
        this.description = description;
        this.createdAt = createdAt;
    }

    public String getAction() { return action; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}