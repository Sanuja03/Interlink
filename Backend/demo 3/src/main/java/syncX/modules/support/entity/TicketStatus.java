package syncX.modules.support.entity;

/**
 * Valid lifecycle states for a SupportTicket.
 * Using an enum instead of a plain String makes invalid values
 * impossible at the type level — no need for runtime whitelist checks.
 */
public enum TicketStatus {
    OPEN,
    PENDING,
    RESOLVED,
    CLOSED
}