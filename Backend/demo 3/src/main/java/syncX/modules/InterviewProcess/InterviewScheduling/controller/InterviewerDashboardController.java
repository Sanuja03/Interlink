package syncX.modules.InterviewProcess.InterviewScheduling.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import syncX.modules.InterviewProcess.InterviewScheduling.dto.InterviewerDashboardDTO;
import syncX.modules.InterviewProcess.InterviewScheduling.service.InterviewerDashboardService;

/**
 * InterviewerDashboardController
 *
 * Base path: /api/interviewer/dashboard
 *
 * GET  /                  → returns full dashboard payload
 *                            { stats, todaySchedule[], nextInterview }
 */
@RestController
@RequestMapping("/api/interviewer/dashboard")
public class InterviewerDashboardController {

    @Autowired
    private InterviewerDashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal Jwt jwt) {
        try {
            InterviewerDashboardDTO.DashboardResponse data =
                    dashboardService.getDashboard(jwt);
            return ResponseEntity.ok(data);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }
}