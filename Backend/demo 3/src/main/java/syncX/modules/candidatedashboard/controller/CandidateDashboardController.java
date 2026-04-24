package syncX.modules.candidatedashboard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.candidatedashboard.dto.DashboardResponseDto;
import syncX.modules.candidatedashboard.service.CandidateDashboardService;
import java.util.UUID;


@RestController
@RequestMapping("/api/dashboard/candidate")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateDashboardController {

    @Autowired
    private CandidateDashboardService dashboardService;

    @GetMapping("/{candidateId}")
    public ResponseEntity<?> getDashboardData(@PathVariable UUID candidateId) {
        try {
            DashboardResponseDto data = dashboardService.getDashboardData(candidateId);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("getDashboardData execution completed.");
        }
    }

    @PostMapping("/seed/{candidateId}")
    public ResponseEntity<?> seedData(@PathVariable UUID candidateId) {
        try {
            dashboardService.seedDummyData(candidateId);
            return ResponseEntity.ok("Dummy data seeded successfully for candidate " + candidateId);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("seedData execution completed.");
        }
    }
}
