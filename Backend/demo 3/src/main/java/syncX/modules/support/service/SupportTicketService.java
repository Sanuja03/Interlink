package syncX.modules.support.service;

import syncX.modules.support.entity.Response;
import syncX.modules.support.entity.SupportTicket;
import syncX.modules.support.repository.ResponseRepository;
import syncX.modules.support.repository.SupportTicketRepository;

import org.springframework.stereotype.Service;

import syncX.modules.support.dto.ResponseDTO;
import syncX.modules.support.dto.SupportTicketDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SupportTicketService {

    private final SupportTicketRepository repository;
    private final ResponseRepository responseRepository;

    public SupportTicketService(SupportTicketRepository repository,
                                ResponseRepository responseRepository) {
        this.repository = repository;
        this.responseRepository = responseRepository;
    }

    public SupportTicket create(SupportTicket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        return repository.save(ticket);
    }

    public List<SupportTicket> getAll() {
        return repository.findAll();
    }

    // ✅ DTO CONVERSION
    public SupportTicketDTO getTicketDTO(Long id) {
        SupportTicket ticket = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        List<ResponseDTO> responses = ticket.getResponses() == null ? List.of() :
                ticket.getResponses().stream()
                        .map(r -> new ResponseDTO(
                                r.getId(),
                                r.getSender(),
                                r.getMessage(),
                                r.getSentAt()
                        ))
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
                responses
        );
    }

    public SupportTicket update(Long id, SupportTicket updated) {
        return repository.findById(id).map(ticket -> {
            ticket.setStatus(updated.getStatus());
            ticket.setPriority(updated.getPriority());
            ticket.setCategory(updated.getCategory());
            return repository.save(ticket);
        }).orElseThrow();
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    // ✅ CHAT FIXED HERE
    public Response addReply(Long ticketId, Response response) {
        SupportTicket ticket = repository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (response.getMessage() == null || response.getMessage().isBlank()) {
            throw new RuntimeException("Message cannot be empty");
        }

        if (response.getSender() == null) {
            response.setSender("REQUESTER");
        }

        response.setTicket(ticket);
        response.setSentAt(LocalDateTime.now());

        return responseRepository.save(response);
    }
}