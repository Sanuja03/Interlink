package syncX.modules.SuperAdmin.Admin_activities.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import syncX.modules.SuperAdmin.Admin_activities.dto.ActivityLogDto;
import syncX.modules.SuperAdmin.Admin_activities.dto.CreateActivityLogDto;
import syncX.modules.SuperAdmin.Admin_activities.service.ActivityLogService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService service;

    // Admin only — read all logs with filters
    @GetMapping("/api/admin/activity-logs")
    public ResponseEntity<?> getLogs(
            @RequestParam(defaultValue = "")  String userRole,
            @RequestParam(defaultValue = "")  String search,
            @RequestParam(defaultValue = "")  String fromDate,
            @RequestParam(defaultValue = "")  String toDate,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            return ResponseEntity.ok(service.getLogs(userRole, search, fromDate, toDate, page, size));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // All authenticated users — create a log entry
    @PostMapping("/api/activity-logs")
    public ResponseEntity<?> createLog(@RequestBody CreateActivityLogDto dto) {
        try {
            return ResponseEntity.ok(service.createLog(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}