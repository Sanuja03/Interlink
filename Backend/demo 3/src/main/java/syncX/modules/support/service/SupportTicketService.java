package syncX.modules.support.service;

import syncX.modules.support.dto.ResponseDTO;
import syncX.modules.support.dto.SupportTicketDTO;
import syncX.modules.support.dto.SupportTicketRequest;
import syncX.modules.support.entity.Response;
import syncX.modules.support.entity.SupportTicket;
import syncX.modules.support.entity.TicketStatus;
import syncX.modules.support.repository.ResponseRepository;
import syncX.modules.support.repository.SupportTicketRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SupportTicketService {

    // ─── Validation constants ─────────────────────────────────────────────────
    // Defined here so they are the single source of truth for the backend.
    // Frontend mirrors these values but backend is the authoritative boundary.
    //DRY Principle enforced

    private static final int TITLE_MIN_LENGTH = 5;
    private static final int TITLE_MAX_LENGTH = 150;
    private static final int DESC_MIN_LENGTH  = 10;
    private static final int DESC_MAX_LENGTH  = 2000;
    private static final int REPLY_MAX_LENGTH = 2000;

    // ─── Dependencies (two repos are injected for use in the service) ────────────────────────────────

    private final SupportTicketRepository repository;
    private final ResponseRepository      responseRepository;

    public SupportTicketService(SupportTicketRepository repository,
                                ResponseRepository responseRepository) {
        this.repository         = repository;
        this.responseRepository = responseRepository;
    }

    // ─── Role lookup ──────────────────────────────────────────────────────────

    /**
     * Fetches the user's role directly from public.users table.
     * Does NOT rely on the JWT role claim — Supabase sets that to
     * "authenticated" for everyone by default.
     */
    public String getRoleFromDb(UUID userId) {
        return repository.findRoleByUserId(userId).orElse("user");  //calls the native query in the repository
    }

    public boolean isSuperAdmin(UUID userId) {
        return "super_admin".equals(getRoleFromDb(userId));     //super admin stored in boolean for future permission checks
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    /**
     * Creates a new ticket from a validated request DTO.
     * Server always sets status to OPEN — client cannot override this.
     *
     * @param request  validated request body (title, description, category only)
     * @param userId   authenticated user's ID from JWT
     * @param email    authenticated user's email from JWT
     * @param name     authenticated user's display name from JWT
     */
    public SupportTicket create(SupportTicketRequest request,
                                UUID userId, String email, String name) {
        validateTicketRequest(request);

        SupportTicket ticket = new SupportTicket();
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(request.getCategory());

        // Server-controlled fields — never taken from the request body
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUserId(userId);
        ticket.setEmail(email);
        ticket.setSubmittedBy(name);

        return repository.save(ticket);
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    public List<SupportTicket> getAll() {   //returns all tickets only for SAs
        return repository.findAll();
    }

    public List<SupportTicket> getByUser(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "User ID must not be null");
        }
        return repository.findByUserId(userId);
    }

    public SupportTicketDTO getTicketDTO(Long id) { //db query to get the tickets
        SupportTicket ticket = repository.findByIdWithResponses(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found with id: " + id));

        List<ResponseDTO> responses = ticket.getResponses() == null
                ? List.of() // if null → return empty list
                : ticket.getResponses().stream()    //convert the tickets to a stream
                .map(r -> new ResponseDTO(r.getId(), r.getSender(),     //get the details of the tickets and put into a new response objects
                        r.getMessage(), r.getSentAt()))
                .toList();  //converts the ticket back into a list

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
                responses               //setting the dto response sent to the frontend
        );
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    /**
     * Admin: can update status, priority, category.
     * Regular user: can only edit title/description/category of their own OPEN tickets.
     *
     * Enum types on SupportTicket mean Jackson already rejects invalid values
     * before this method is called — no additional whitelist check needed here.
     */
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
            if (TicketStatus.OPEN != ticket.getStatus()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Only OPEN tickets can be edited");
            }
            // Validate user-supplied text fields
            if (updated.getTitle() != null) {
                validateLength("Title", updated.getTitle(), TITLE_MIN_LENGTH, TITLE_MAX_LENGTH);
                ticket.setTitle(updated.getTitle().trim());
            }
            if (updated.getDescription() != null) {
                validateLength("Description", updated.getDescription(), DESC_MIN_LENGTH, DESC_MAX_LENGTH);
                ticket.setDescription(updated.getDescription().trim());
            }
            if (updated.getCategory() != null) {
                ticket.setCategory(updated.getCategory());
            }
        }

        return repository.save(ticket);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    public void delete(Long id, UUID requestingUserId) {
        SupportTicket ticket = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found with id: " + id));

        if (!isSuperAdmin(requestingUserId) &&
                !ticket.getUserId().equals(requestingUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to delete this ticket");
        }

        repository.deleteById(id);
    }

    // ─── REPLY ────────────────────────────────────────────────────────────────

    /**
     * Adds a reply to a ticket.
     * Sender is always determined server-side from the DB role —
     * the frontend cannot fake being ADMIN by sending sender:"ADMIN".
     */
    public ResponseDTO addReply(Long ticketId, Response response,
                                UUID requestingUserId) {
        SupportTicket ticket = repository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found with id: " + ticketId));

        if (TicketStatus.CLOSED == ticket.getStatus()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot reply to a CLOSED ticket");
        }

        // UX + security: presence and length validation
        if (response.getMessage() == null || response.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reply message cannot be empty");
        }
        if (response.getMessage().length() > REPLY_MAX_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reply must be " + REPLY_MAX_LENGTH + " characters or fewer");
        }

        // Sender set from DB role — never from request body
        response.setSender(isSuperAdmin(requestingUserId) ? "ADMIN" : "REQUESTER");
        response.setTicket(ticket);
        response.setSentAt(LocalDateTime.now());

        Response saved = responseRepository.save(response);
        return new ResponseDTO(saved.getId(), saved.getSender(),
                saved.getMessage(), saved.getSentAt());
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Validates required text fields on a ticket creation request.
     * Backend is the authoritative validation boundary —
     * frontend validation is UX only and can be bypassed.
     */
    private void validateTicketRequest(SupportTicketRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Title is required");
        }
        validateLength("Title", request.getTitle(), TITLE_MIN_LENGTH, TITLE_MAX_LENGTH);

        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Description is required");
        }
        validateLength("Description", request.getDescription(), DESC_MIN_LENGTH, DESC_MAX_LENGTH);

        if (request.getCategory() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Category is required");
        }
    }

    /**
     * Reusable length check. Throws 400 with a clear message if violated.
     *
     * @param fieldName human-readable name for the error message
     * @param value     the string to check
     * @param min       minimum length (inclusive)
     * @param max       maximum length (inclusive)
     */
    private void validateLength(String fieldName, String value, int min, int max) {
        int len = value.trim().length();
        if (len < min) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    fieldName + " must be at least " + min + " characters");
        }
        if (len > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    fieldName + " must be " + max + " characters or fewer");    //reusable called in title and and dec
        }
    }
}