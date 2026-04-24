package syncX.modules.InterviewProcess.Availability.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import syncX.modules.InterviewProcess.Availability.dto.AvailabilityDTO;
import syncX.modules.InterviewProcess.Availability.service.AvailabilityService;

import java.util.List;

@RestController
@RequestMapping("/api/company/availability")
public class CompanyAvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    /**
     * Get all interviewers' availability for a given week.
     * Used by admin to see who's available before sending requests.
     * GET /api/company/availability/week?weekKey=2026-W17
     */
    @GetMapping("/week")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<AvailabilityDTO.InterviewerWeekSummary>> getWeekAvailability(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String weekKey) {

        List<AvailabilityDTO.InterviewerWeekSummary> result =
                availabilityService.getCompanyWeekAvailability(jwt, weekKey);
        return ResponseEntity.ok(result);
    }

    /**
     * Get interviewers available on a specific date.
     * Used by admin when scheduling an interview for a specific day.
     * GET /api/company/availability/date?date=2026-04-23
     */
    @GetMapping("/date")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<AvailabilityDTO.InterviewerDateEntry>> getDateAvailability(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String date) {

        List<AvailabilityDTO.InterviewerDateEntry> result =
                availabilityService.getAvailableOnDate(jwt, date);
        return ResponseEntity.ok(result);
    }
}
