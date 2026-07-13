package syncX.modules.SuperAdmin.Admin_dashboard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import syncX.modules.SuperAdmin.Admin_dashboard.dto.AdminDashboardDto;
import syncX.modules.SuperAdmin.Admin_dashboard.service.AdminDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService service;

    @GetMapping
    public AdminDashboardDto getAdminDashboard() {
        return service.getAdminDashboardData();
    }
}