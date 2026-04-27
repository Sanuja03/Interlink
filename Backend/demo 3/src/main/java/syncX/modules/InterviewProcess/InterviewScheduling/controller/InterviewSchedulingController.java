package syncX.modules.InterviewProcess.InterviewScheduling.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import syncX.modules.InterviewProcess.InterviewScheduling.dto.InterviewSchedulingDTO;
import syncX.modules.InterviewProcess.InterviewScheduling.service.InterviewSchedulingService;

import java.util.UUID;

/**
 * InterviewSchedulingController
 *
 * Base path: /api/company/interview-scheduling
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ POST /finalize                                                       │
 * │   Body: { requestId, meetingLink? }                                  │
 * │   Finalizes a panel → creates interview_scheduled row,              │
 * │   sets request status = "finalised".                                │
 * │   Returns ScheduledResponse (includes accepted interviewers)        │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ GET /{requestId}                                                     │
 * │   Returns the scheduled record for a finalized request.             │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ PATCH /{requestId}/scorecard                                         │
 * │   Body: { scorecardId }                                              │
 * │   Saves the chosen scorecard ID — called when admin clicks          │
 * │   "Send Scheduled Interview Details" in FinalizedPanelPopup.        │
 * └─────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/company/interview-scheduling")
public class InterviewSchedulingController {

    @Autowired
    private InterviewSchedulingService schedulingService;

    // ── POST /finalize ────────────────────────────────────────────
    @PostMapping("/finalize")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> finalizePanel(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody InterviewSchedulingDTO.FinalizeRequest body) {

        try {
            InterviewSchedulingDTO.ScheduledResponse result =
                    schedulingService.finalizePanel(jwt, body);
            return ResponseEntity.ok(result);

        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(
                    java.util.Map.of("error", e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("error", e.getMessage()));
        }
    }

    // ── GET /{requestId} ──────────────────────────────────────────
    @GetMapping("/{requestId}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> getScheduled(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId) {

        try {
            return ResponseEntity.ok(
                    schedulingService.getByRequestId(jwt, requestId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(
                    java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("error", e.getMessage()));
        }
    }

    // ── PATCH /{requestId}/scorecard ──────────────────────────────
    @PatchMapping("/{requestId}/scorecard")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> saveScorecard(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId,
            @RequestBody InterviewSchedulingDTO.SaveScorecardRequest body) {

        try {
            return ResponseEntity.ok(
                    schedulingService.saveScorecard(jwt, requestId, body));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(
                    java.util.Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("error", e.getMessage()));
        }
    }
}