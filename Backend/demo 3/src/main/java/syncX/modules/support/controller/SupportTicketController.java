package syncX.modules.support.controller;

import syncX.modules.support.service.SupportTicketService;

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

    private final SupportTicketService service;

    public SupportTicketController(SupportTicketService service) {
        this.service = service;
    }

    @PostMapping
    public SupportTicket create(@RequestBody SupportTicket ticket) {
        return service.create(ticket);
    }

    @GetMapping
    public List<SupportTicket> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicket> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}