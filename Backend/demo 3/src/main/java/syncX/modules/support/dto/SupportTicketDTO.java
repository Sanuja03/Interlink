package syncX.modules.support.dto;

import syncX.modules.support.entity.TicketCategory;
import syncX.modules.support.entity.TicketPriority;
import syncX.modules.support.entity.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Read-only projection of a SupportTicket with its responses.
 * Returned on GET /tickets/:id — never exposes raw entity internals.
 */
public class SupportTicketDTO {

    private Long            id;
    private String          title;
    private String          description;
    private TicketStatus    status;
    private TicketPriority  priority;
    private TicketCategory  category;
    private String          email;
    private String          submittedBy;
    private LocalDateTime   createdAt;
    private UUID            userId;
    private List<ResponseDTO> responses;
    // ADDED
    private Boolean         requesterRead;
    private Boolean         adminRead;
    // END ADDED

    public SupportTicketDTO(Long id, String title, String description,
                            TicketStatus status, TicketPriority priority,
                            TicketCategory category, String email,
                            String submittedBy, LocalDateTime createdAt,
                            UUID userId, List<ResponseDTO> responses,
                            Boolean requesterRead, Boolean adminRead) { // ADDED params
        this.id          = id;
        this.title       = title;
        this.description = description;
        this.status      = status;
        this.priority    = priority;
        this.category    = category;
        this.email       = email;
        this.submittedBy = submittedBy;
        this.createdAt   = createdAt;
        this.userId      = userId;
        this.responses   = responses;
        this.requesterRead = requesterRead; // ADDED
        this.adminRead      = adminRead;     // ADDED
    }

    public Long              getId()          { return id;          }
    public String            getTitle()       { return title;       }
    public String            getDescription() { return description; }
    public TicketStatus      getStatus()      { return status;      }
    public TicketPriority    getPriority()    { return priority;    }
    public TicketCategory    getCategory()    { return category;    }
    public String            getEmail()       { return email;       }
    public String            getSubmittedBy() { return submittedBy; }
    public LocalDateTime     getCreatedAt()   { return createdAt;   }
    public UUID              getUserId()      { return userId;      }
    public List<ResponseDTO> getResponses()   { return responses;   }
    // ADDED
    public Boolean getRequesterRead() { return requesterRead; }
    public Boolean getAdminRead()     { return adminRead;     }
    // END ADDED
}