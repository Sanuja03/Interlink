package syncX.modules.support.entity;

/**
 * Valid priority levels for a SupportTicket.
 * Enum enforcement means a bad actor cannot inject arbitrary strings
 * like "&lt;script&gt;" through the priority field.
 */
public enum TicketPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}