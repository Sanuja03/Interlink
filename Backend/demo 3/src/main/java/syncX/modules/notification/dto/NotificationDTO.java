package syncX.modules.notification.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String referenceId;
    private boolean read;
    private OffsetDateTime createdAt;
}