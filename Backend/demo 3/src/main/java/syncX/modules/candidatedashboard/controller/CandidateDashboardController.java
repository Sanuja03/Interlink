package syncX.modules.candidatedashboard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import syncX.modules.candidatedashboard.dto.DashboardResponseDto;
import syncX.modules.candidatedashboard.service.CandidateDashboardService;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard/candidate")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateDashboardController {

    private final CandidateDashboardService dashboardService;

    public CandidateDashboardController(CandidateDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getDashboardData() {
        try {
            DashboardResponseDto data = dashboardService.getDashboardDataForCurrentCandidate();
            return ResponseEntity.ok(data);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching candidate dashboard: " + e.getMessage()));
        }
    }
}
