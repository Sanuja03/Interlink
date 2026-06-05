package syncX.modules.support.controller;

import syncX.modules.support.dto.SupportTicketDTO;
import syncX.modules.support.entity.Response;
import syncX.modules.support.service.SupportTicketService;
import syncX.modules.support.entity.SupportTicket;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.support.dto.ResponseDTO;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class SupportTicketController {

    private final SupportTicketService service;

    public SupportTicketController(SupportTicketService service) {
        this.service = service;
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<SupportTicket> create(
            @RequestBody SupportTicket ticket,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId      = UUID.fromString(jwt.getSubject());
        String email     = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName  = jwt.getClaimAsString("family_name");

        ticket.setUserId(userId);
        ticket.setEmail(email);

        if (firstName != null || lastName != null) {
            String fullName = ((firstName != null ? firstName : "") + " " +
                    (lastName  != null ? lastName  : "")).trim();
            ticket.setSubmittedBy(fullName);
        } else if (email != null) {
            // Fall back to email prefix (e.g. "svmalalanayake" from "svmalalanayake@gmail.com")
            ticket.setSubmittedBy(email.split("@")[0]);
        } else {
            ticket.setSubmittedBy("Unknown");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(ticket));
    }

    // ─── LIST ─────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getTickets(
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        // Role is looked up from public.users — not from the JWT claim
        List<SupportTicket> tickets = service.isSuperAdmin(userId)
                ? service.getAll()
                : service.getByUser(userId);

        return ResponseEntity.ok(tickets);
    }

    // ─── GET BY ID ────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketDTO> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        SupportTicketDTO dto = service.getTicketDTO(id);

        // Non-admins can only view their own tickets
        if (!service.isSuperAdmin(userId) && !userId.equals(dto.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(dto);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

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

    @PostMapping("/{id}/reply")
    public ResponseEntity<ResponseDTO> reply(
            @PathVariable Long id,
            @RequestBody Response response,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.addReply(id, response, userId));
    }
}