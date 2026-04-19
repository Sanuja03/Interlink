package syncX.modules.support.controller;

import syncX.modules.support.entity.SupportTicket;
import syncX.modules.support.repository.SupportTicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class SupportTicketController {

    private final SupportTicketRepository repository;

    public SupportTicketController(SupportTicketRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public SupportTicket create(@RequestBody SupportTicket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        return repository.save(ticket);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicket> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ticket -> ResponseEntity.ok(ticket))   // FIXED
                .orElseGet(() -> ResponseEntity.notFound().build()); // FIXED
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupportTicket> update(
            @PathVariable Long id,
            @RequestBody SupportTicket updatedTicket) {

        return repository.findById(id)
                .map(ticket -> {
                    ticket.setTitle(updatedTicket.getTitle());
                    ticket.setDescription(updatedTicket.getDescription());
                    ticket.setStatus(updatedTicket.getStatus());
                    return ResponseEntity.ok(repository.save(ticket));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {

        return repository.findById(id)
                .map(ticket -> {
                    if (!ticket.getStatus().equals("OPEN")) {
                        return ResponseEntity
                                .badRequest()
                                .body("Only OPEN tickets can be deleted");
                    }

                    repository.delete(ticket);
                    return ResponseEntity.ok("Ticket deleted successfully");
                })
                .orElseGet(() -> ResponseEntity.notFound().build()); // FIXED
    }
}