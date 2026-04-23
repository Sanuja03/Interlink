package syncX.modules.SuperAdmin.Admin_activities.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import syncX.modules.SuperAdmin.Admin_activities.entity.ActivityLog;
import syncX.modules.SuperAdmin.Admin_activities.service.ActivityLogService;

@RestController
@RequestMapping("/api/admin/activity-logs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService service;

    // Dashboard + All Activities
    @GetMapping
    public Page<ActivityLog> getLogs(
            @RequestParam(defaultValue = "") String userRole,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.getLogs(userRole, search, fromDate, toDate, page, size);
    }

    @PostMapping
    public ActivityLog createActivityLog(@RequestBody ActivityLog log) {
        return service.createLog(log);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleError(Exception e) {
        return ResponseEntity.status(500).body("Something went wrong");
    }

}
