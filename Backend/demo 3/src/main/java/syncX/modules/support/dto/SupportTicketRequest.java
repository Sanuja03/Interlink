package syncX.modules.support.dto;

import syncX.modules.support.entity.TicketCategory;

/**
 * Request DTO for creating a new support ticket.
 *
 * Using a dedicated request DTO instead of the raw entity ensures:
 * - Users cannot inject server-controlled fields (userId, status, createdAt)
 * - Only the fields we explicitly allow are accepted from the request body
 * - category is typed as TicketCategory enum — Jackson rejects invalid values
 */
public class SupportTicketRequest {

    private String         title;
    private String         description;
    private TicketCategory category;

    public SupportTicketRequest() {}

    public String getTitle()               { return title;       }
    public void   setTitle(String title)   { this.title = title; }

    public String getDescription()                     { return description;             }
    public void   setDescription(String description)   { this.description = description; }

    public TicketCategory getCategory()                        { return category;              }
    public void           setCategory(TicketCategory category) { this.category = category;     }
}