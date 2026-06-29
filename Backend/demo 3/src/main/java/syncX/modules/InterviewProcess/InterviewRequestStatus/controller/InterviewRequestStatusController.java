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


@RestController
@RequestMapping("/api/company/interview-requests/status")
public class InterviewRequestStatusController {

    @Autowired
    private InterviewRequestStatusService statusService;


    //button status in shortlisted page
    @GetMapping("/current")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> getCurrentStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam UUID candidateId,
            @RequestParam Long jobApplicationId,
            @RequestParam(required = false) Long historyId) {  // optional — scopes to the round

        InterviewRequestStatusDTO.StatusResponse response =
                statusService.getStatus(jwt, candidateId, jobApplicationId, historyId);

        if (response == null) {
            return ResponseEntity.noContent().build();   // 204 → frontend opens fresh request form
        }

        return ResponseEntity.ok(response);
    }


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

    // Resets a rejected interviewer's response_status back to "pending"
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