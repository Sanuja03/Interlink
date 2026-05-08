package syncX.modules.InterviewProcess.InterviewRequest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import syncX.modules.InterviewProcess.InterviewRequest.dto.InterviewRequestDTO;
import syncX.modules.InterviewProcess.InterviewRequest.service.InterviewRequestService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviewer/interview-requests")
public class InterviewerRequestController {

    @Autowired
    private InterviewRequestService service;


    @GetMapping("/pending")
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<?> getMyPending(
            @AuthenticationPrincipal Jwt jwt) {
        try {
            List<InterviewRequestDTO.PendingRequestForInterviewer> result =
                    service.getPendingForInterviewer(jwt);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage() != null
                            ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }

    /**
     * PUT /api/interviewer/interview-requests/{requestId}/respond?response=accepted
     */
    @PutMapping("/{requestId}/respond")
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<?> respond(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId,
            @RequestParam String response) {
        try {
            UUID userId = UUID.fromString(jwt.getSubject());
            service.respondToRequest(requestId, userId, response);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }
}