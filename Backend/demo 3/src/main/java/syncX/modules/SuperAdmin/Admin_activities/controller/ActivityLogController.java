package syncX.modules.SuperAdmin.Admin_activities.controller;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return service.getLogs(userRole, page, size);
    }

}
