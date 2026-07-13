package syncX.modules.SuperAdmin.Admin_activities.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import syncX.modules.SuperAdmin.Admin_activities.dto.ActivityLogDto;
import syncX.modules.SuperAdmin.Admin_activities.dto.CreateActivityLogDto;
import syncX.modules.SuperAdmin.Admin_activities.service.ActivityLogService;

@RestController
@RequestMapping("/api/admin/activity-logs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService service;

    // GET LOGS (DTO)
    @GetMapping
    public Page<ActivityLogDto> getLogs(
            @RequestParam(defaultValue = "") String userRole,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.getLogs(userRole, search, fromDate, toDate, page, size);
    }

    // CREATE LOG (DTO)
    @PostMapping
    public ActivityLogDto createActivityLog(@RequestBody CreateActivityLogDto dto) {
        return service.createLog(dto);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleError(Exception e) {
        return ResponseEntity.status(500).body("Something went wrong");
    }
}