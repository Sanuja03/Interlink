package syncX.modules.support.controller;

import syncX.modules.support.dto.SupportTicketDTO;
import syncX.modules.support.entity.Response;
import syncX.modules.support.service.SupportTicketService;

import syncX.modules.support.entity.SupportTicket;
import syncX.modules.support.repository.SupportTicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.support.dto.ResponseDTO;

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

    // ✅ RETURN DTO
    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTicketDTO(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupportTicket> update(
            @PathVariable Long id,
            @RequestBody SupportTicket updatedTicket) {

        return ResponseEntity.ok(service.update(id, updatedTicket));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<Response> reply(
            @PathVariable Long id,
            @RequestBody Response response) {

        return ResponseEntity.ok(service.addReply(id, response));
    }
}