package syncX.modules.support.service;

import syncX.modules.support.entity.SupportTicket;
import syncX.modules.support.repository.SupportTicketRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SupportTicketService {

    private final SupportTicketRepository repository;

    public SupportTicketService(SupportTicketRepository repository) {
        this.repository = repository;
    }

    public SupportTicket create(SupportTicket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        return repository.save(ticket);
    }

    public List<SupportTicket> getAll() {
        return repository.findAll();
    }

    public Optional<SupportTicket> getById(Long id) {
        return repository.findById(id);
    }
}