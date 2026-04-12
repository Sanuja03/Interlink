package syncX.support.controller;


import syncX.support.entity.SupportTicket;
import syncX.support.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository repository;     //Dependency Injection - injects the repository automatically by creating a new object.

    @PostMapping
    public SupportTicket create(@RequestBody SupportTicket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        return repository.save(ticket);     //saving the ticket to the database 
    }

    @GetMapping
    public List<SupportTicket> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
public ResponseEntity<SupportTicket> getById(@PathVariable Long id) {
    return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
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
            .orElse(ResponseEntity.notFound().build());
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
            .orElse(ResponseEntity.notFound().build());
}


}
