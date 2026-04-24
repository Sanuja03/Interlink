package syncX.modules.support.controller;

import syncX.modules.support.dto.ResponseDTO;
import syncX.modules.support.dto.SupportTicketDTO;
import syncX.modules.support.dto.SupportTicketRequest;
import syncX.modules.support.entity.Response;
import syncX.modules.support.entity.SupportTicket;
import syncX.modules.support.service.SupportTicketService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * REST controller for support ticket operations.
 *
 * Security notes:
 * - All endpoints require a valid JWT (@AuthenticationPrincipal Jwt jwt)
 * - Role checks are performed in the service layer via DB lookup,
 *   not from the JWT role claim (Supabase sets that to "authenticated")
 * - CORS restricted to the frontend origin only
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class SupportTicketController {

    private final SupportTicketService service;

    public SupportTicketController(SupportTicketService service) {
        this.service = service;
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    /**
     * Creates a new ticket.
     * Accepts SupportTicketRequest (not the raw entity) so clients
     * cannot inject server-controlled fields like userId or status.
     */
    @PostMapping
    public ResponseEntity<SupportTicket> create(
            @RequestBody SupportTicketRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        UUID   userId    = UUID.fromString(jwt.getSubject());
        String email     = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName  = jwt.getClaimAsString("family_name");

        // Build display name from JWT claims with graceful fallbacks
        String name;
        if (firstName != null || lastName != null) {
            name = ((firstName != null ? firstName : "") + " " +
                    (lastName  != null ? lastName  : "")).trim();
        } else if (email != null) {
            // Fall back to email prefix (e.g. "svmalalanayake@gmail.com" → "svmalalanayake")
            name = email.split("@")[0];
        } else {
            name = "Unknown";
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(request, userId, email, name));
    }

    // ─── LIST ─────────────────────────────────────────────────────────────────

    /**
     * Super admins get all tickets; regular users get only their own.
     * Role is resolved from the DB, not the JWT claim.
     */
    @GetMapping
    public ResponseEntity<List<SupportTicket>> getTickets(
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        List<SupportTicket> tickets = service.isSuperAdmin(userId)
                ? service.getAll()
                : service.getByUser(userId);

        return ResponseEntity.ok(tickets);
    }

    // ─── GET BY ID ────────────────────────────────────────────────────────────

    /**
     * Returns a single ticket with its full conversation history.
     * Non-admins can only view tickets they submitted.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketDTO> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        SupportTicketDTO dto = service.getTicketDTO(id);

        if (!service.isSuperAdmin(userId) && !userId.equals(dto.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(dto);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    /**
     * Partial update — fields allowed depend on the caller's role.
     * Admin: status, priority, category.
     * User: title, description, category (OPEN tickets only).
     *
     * Enum fields on SupportTicket mean Jackson rejects invalid values
     * (e.g. status:"HACKED") with a 400 before reaching service logic.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SupportTicket> update(
            @PathVariable Long id,
            @RequestBody SupportTicket updatedTicket,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(service.update(id, updatedTicket, userId));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        service.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ─── REPLY ────────────────────────────────────────────────────────────────

    /**
     * Adds a reply to a ticket.
     * The sender field is always overwritten server-side — the request body
     * value is intentionally ignored for security.
     */
    @PostMapping("/{id}/reply")
    public ResponseEntity<ResponseDTO> reply(
            @PathVariable Long id,
            @RequestBody Response response,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.addReply(id, response, userId));
    }
}