package syncX.modules.CompanyAdmin.ApplicationManagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.ApplicationManagement;
import syncX.modules.CompanyAdmin.ApplicationManagement.service.ApplicationManagementService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // allow frontend
public class ApplicationManagementController {

    private final ApplicationManagementService service;

    // ✅ CREATE APPLICATION
    @PostMapping
    public ResponseEntity<ApplicationManagement> create(@RequestBody ApplicationManagement app) {
        ApplicationManagement saved = service.save(app);
        return ResponseEntity.ok(saved);
    }

    // ✅ GET ALL APPLICATIONS
    @GetMapping
    public ResponseEntity<List<ApplicationManagement>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // 🔥 UPDATE STATUS (PROGRESS / REJECT)
    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationManagement> updateStatus(
            @PathVariable UUID id,
            @RequestParam String action
    ) {
        ApplicationManagement updated = service.updateStatus(id, action);
        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE APPLICATION
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok("Application deleted successfully");
    }
}