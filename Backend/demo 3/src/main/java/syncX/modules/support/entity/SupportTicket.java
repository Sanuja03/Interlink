package syncX.modules.support.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonManagedReference; //library to convert Java Onjects  to JSON

/**
 * Persistent entity for a user-submitted support ticket.
 *
 * Security notes:
 * - status, priority, category are stored as enums — invalid string values
 *   are rejected by Jackson deserialization before they reach service logic.
 * - Column length constraints act as a database-level safety net on top of
 *   the service-layer length validation.
 */
@Entity
@Table(name = "support_tickets")
public class SupportTicket {

    @Id //marking the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)     //handled automatically by db
    private Long id;

    // Database-level length constraints — defence-in-depth below service validation - to prtect direct data inputs that bypass service level validation
    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 5000, columnDefinition = "TEXT")     //Text type used inorder toprovide more space space than varchar
    private String description;

    /**
     * Stored as a string in the DB for readability, but validated through
     * the TicketStatus enum on the Java side. Jackson will reject any value
     * that doesn't match a known enum constant with a 400 error.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketCategory category;

    @Column(length = 255)
    private String email;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "submitted_by", length = 255)
    private String submittedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Response> responses;  //List is used here instead of arrays here because of lists flexible size - we are not sure how many response we will get

    public SupportTicket() {}

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Response> getResponses() { return responses; }
    public void setResponses(List<Response> responses) { this.responses = responses; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
}