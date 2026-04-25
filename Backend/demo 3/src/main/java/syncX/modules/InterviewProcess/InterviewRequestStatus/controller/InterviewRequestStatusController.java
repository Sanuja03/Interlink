package syncX.modules.InterviewProcess.InterviewRequestStatus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import syncX.modules.InterviewProcess.InterviewRequestStatus.dto.InterviewRequestStatusDTO;
import syncX.modules.InterviewProcess.InterviewRequestStatus.service.InterviewRequestStatusService;

import java.util.UUID;

/**
 * REST endpoints consumed exclusively by the RequestStatusPopup (frontend).
 *
 * Base path: /api/company/interview-requests/status
 *
 * All endpoints require the caller to have the 'company_admin' role.
 * The service layer scopes every query to the JWT caller's own company —
 * a company admin cannot read or mutate requests belonging to another company.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ GET  /status/current                                                 │
 * │   Query params: candidateId (UUID), jobApplicationId (Long)          │
 * │   Returns the live status of the active (non-cancelled) request for  │
 * │   this (candidate, application) pair, including every invited         │
 * │   interviewer and their current responseStatus.                      │
 * │   → 200 with StatusResponse body                                     │
 * │   → 204 No Content if no active request exists                       │
 * ├──────────────────────────────────────────────────────────────────────┤
 * │ DELETE  /status/{requestId}/interviewers/{interviewerUserId}         │
 * │   Removes one interviewer from the active request by flipping their  │
 * │   responseStatus to "rejected".  This automatically removes the row  │
 * │   from the interviewer's own pending-requests view (the existing DB  │
 * │   query already filters WHERE responseStatus = 'pending').           │
 * │   → 200 with RemoveInterviewerResponse (updated counts)              │
 * └──────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/company/interview-requests/status")
public class InterviewRequestStatusController {

    @Autowired
    private InterviewRequestStatusService statusService;

    // ────────────────────────────────────────────────────────────────
    // GET /api/company/interview-requests/status/current
    // ────────────────────────────────────────────────────────────────
    @GetMapping("/current")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> getCurrentStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam UUID candidateId,
            @RequestParam Long jobApplicationId) {

        InterviewRequestStatusDTO.StatusResponse response =
                statusService.getStatus(jwt, candidateId, jobApplicationId);

        if (response == null) {
            // No active (non-cancelled) request exists for this pair
            return ResponseEntity.noContent().build();   // 204
        }

        return ResponseEntity.ok(response);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/company/interview-requests/status/{requestId}/interviewers/add
    // Adds new interviewers to an existing pending request without
    // disturbing accepted/pending rows already on the request.
    // ────────────────────────────────────────────────────────────────
    @PostMapping("/{requestId}/interviewers/add")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> addInterviewers(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId,
            @RequestBody InterviewRequestStatusDTO.AddInterviewersRequest body) {

        try {
            InterviewRequestStatusDTO.StatusResponse result =
                    statusService.addInterviewers(jwt, requestId, body.getInterviewerUserIds());
            return ResponseEntity.ok(result);

        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // ────────────────────────────────────────────────────────────────
    // PUT /api/company/interview-requests/status/{requestId}/interviewers/{interviewerUserId}/resend
    // Resets a rejected interviewer's response_status back to "pending"
    // so the request reappears in their pending-requests page.
    // ────────────────────────────────────────────────────────────────
    @PutMapping("/{requestId}/interviewers/{interviewerUserId}/resend")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> resendToInterviewer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId,
            @PathVariable UUID interviewerUserId) {

        try {
            statusService.resendToInterviewer(jwt, requestId, interviewerUserId);
            return ResponseEntity.ok().build();

        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(
                    java.util.Map.of("error", e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("error", e.getMessage()));
        }
    }

    // ────────────────────────────────────────────────────────────────
    // DELETE /api/company/interview-requests/status/{requestId}/interviewers/{interviewerUserId}
    // ────────────────────────────────────────────────────────────────
    @DeleteMapping("/{requestId}/interviewers/{interviewerUserId}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> removeInterviewer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId,
            @PathVariable UUID interviewerUserId) {

        try {
            InterviewRequestStatusDTO.RemoveInterviewerResponse result =
                    statusService.removeInterviewer(jwt, requestId, interviewerUserId);

            return ResponseEntity.ok(result);

        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(
                    java.util.Map.of("error", e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(
                    java.util.Map.of("error", e.getMessage()));
        }
    }
}