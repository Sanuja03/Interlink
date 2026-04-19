package syncX.modules.support.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SupportTicketDTO {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String category;
    private String email;
    private String submittedBy;
    private LocalDateTime createdAt;

    private List<ResponseDTO> responses;

    public SupportTicketDTO(Long id, String title, String description,
                            String status, String priority, String category,
                            String email, String submittedBy,
                            LocalDateTime createdAt,
                            List<ResponseDTO> responses) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.category = category;
        this.email = email;
        this.submittedBy = submittedBy;
        this.createdAt = createdAt;
        this.responses = responses;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getPriority() { return priority; }
    public String getCategory() { return category; }
    public String getEmail() { return email; }
    public String getSubmittedBy() { return submittedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<ResponseDTO> getResponses() { return responses; }
}