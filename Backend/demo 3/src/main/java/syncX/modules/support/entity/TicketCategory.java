package syncX.modules.support.entity;

/**
 * Valid category values for a SupportTicket.
 * Must match the values the frontend sends exactly (case-sensitive).
 */
public enum TicketCategory {
    GENERAL,
    LOGIN,
    PAYMENT,
    TECHNICAL
}