package syncX.modules.support.service;

import syncX.modules.support.dto.ResponseDTO;
import syncX.modules.support.entity.Response;
import syncX.modules.support.entity.SupportTicket;
import syncX.modules.support.repository.ResponseRepository;
import syncX.modules.support.repository.SupportTicketRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import syncX.modules.support.dto.SupportTicketDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SupportTicketService {

    private final SupportTicketRepository repository;
    private final ResponseRepository      responseRepository;

    public SupportTicketService(SupportTicketRepository repository,
                                ResponseRepository responseRepository) {
        this.repository         = repository;
        this.responseRepository = responseRepository;
    }

    // ─── ROLE LOOKUP FROM DB ─────────────────────────────────────────────────

    /**
     * Fetches the user's role directly from public.users table.
     * Does NOT rely on the JWT role claim (Supabase sets that to
     * "authenticated" for everyone by default).
     */
    public String getRoleFromDb(UUID userId) {
        return repository.findRoleByUserId(userId).orElse("user");
    }

    public boolean isSuperAdmin(UUID userId) {
        return "super_admin".equals(getRoleFromDb(userId));
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    public SupportTicket create(SupportTicket ticket) {
        validateTicket(ticket);
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        return repository.save(ticket);
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    public List<SupportTicket> getAll() {
        return repository.findAll();
    }

    public List<SupportTicket> getByUser(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID must not be null");
        }
        return repository.findByUserId(userId);
    }

    public SupportTicketDTO getTicketDTO(Long id) {
        SupportTicket ticket = repository.findByIdWithResponses(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found with id: " + id));

        List<ResponseDTO> responses = ticket.getResponses() == null
                ? List.of()
                : ticket.getResponses().stream()
                .map(r -> new ResponseDTO(r.getId(), r.getSender(),
                        r.getMessage(), r.getSentAt()))
                .toList();

        return new SupportTicketDTO(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCategory(),
                ticket.getEmail(),
                ticket.getSubmittedBy(),
                ticket.getCreatedAt(),
                ticket.getUserId(),
                responses
        );
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    public SupportTicket update(Long id, SupportTicket updated, UUID requestingUserId) {
        SupportTicket ticket = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found with id: " + id));

        boolean isAdmin = isSuperAdmin(requestingUserId);

        if (isAdmin) {
            if (updated.getStatus()   != null) ticket.setStatus(updated.getStatus());
            if (updated.getPriority() != null) ticket.setPriority(updated.getPriority());
            if (updated.getCategory() != null) ticket.setCategory(updated.getCategory());
        } else {
            if (!ticket.getUserId().equals(requestingUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You do not have permission to modify this ticket");
            }
            if (!"OPEN".equals(ticket.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Only OPEN tickets can be edited");
            }
            if (updated.getTitle()       != null) ticket.setTitle(updated.getTitle());
            if (updated.getDescription() != null) ticket.setDescription(updated.getDescription());
            if (updated.getCategory()    != null) ticket.setCategory(updated.getCategory());
        }

        return repository.save(ticket);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    public void delete(Long id, UUID requestingUserId) {
        SupportTicket ticket = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found with id: " + id));

        if (!isSuperAdmin(requestingUserId) && !ticket.getUserId().equals(requestingUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to delete this ticket");
        }

        repository.deleteById(id);
    }

    // ─── REPLY ────────────────────────────────────────────────────────────────

    public ResponseDTO addReply(Long ticketId, Response response, UUID requestingUserId) {
        SupportTicket ticket = repository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found with id: " + ticketId));

        if ("CLOSED".equals(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot reply to a CLOSED ticket");
        }

        if (response.getMessage() == null || response.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reply message cannot be empty");
        }

        // Determine sender from actual DB role — not from frontend input
        response.setSender(isSuperAdmin(requestingUserId) ? "ADMIN" : "REQUESTER");
        response.setTicket(ticket);
        response.setSentAt(LocalDateTime.now());

        Response saved = responseRepository.save(response);
        return new ResponseDTO(saved.getId(), saved.getSender(),
                saved.getMessage(), saved.getSentAt());
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private void validateTicket(SupportTicket ticket) {
        if (ticket.getTitle() == null || ticket.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (ticket.getDescription() == null || ticket.getDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
        }
        if (ticket.getCategory() == null || ticket.getCategory().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
        }
    }
}