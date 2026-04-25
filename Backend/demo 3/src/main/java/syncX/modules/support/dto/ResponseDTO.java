package syncX.modules.support.dto;

import java.time.LocalDateTime;

public class ResponseDTO {

    private Long id;
    private String sender;
    private String message;
    private LocalDateTime sentAt;

    public ResponseDTO(Long id, String sender, String message, LocalDateTime sentAt) {
        this.id = id;
        this.sender = sender;
        this.message = message;
        this.sentAt = sentAt;
    }

    public Long getId() { return id; }
    public String getSender() { return sender; }
    public String getMessage() { return message; }
    public LocalDateTime getSentAt() { return sentAt; }
}
