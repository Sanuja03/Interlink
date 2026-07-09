package syncX.modules.CompanyAdmin.ComapyDashBoard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import syncX.modules.CompanyAdmin.ComapyDashBoard.DTO.DashboardStatsDTO;
import syncX.modules.CompanyAdmin.ComapyDashBoard.Service.DashboardService;

import java.util.UUID;

@RestController
@RequestMapping("/api/company/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats/{companyId}")
    public ResponseEntity<DashboardStatsDTO> getStats(@PathVariable UUID companyId) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(companyId));
    }
}