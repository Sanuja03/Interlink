package syncX.modules.InterviewProcess.InterviewRequest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import syncX.modules.InterviewProcess.InterviewRequest.dto.InterviewRequestDTO;
import syncX.modules.InterviewProcess.InterviewRequest.service.InterviewRequestService;
import syncX.modules.CompanyAdmin.AiQuestionScore.dto.AiQuestionScoreDTO;
import syncX.modules.CompanyAdmin.CandidateHistory.dto.CandidateHistoryResponseDTO;
import syncX.modules.CompanyAdmin.CandidateProfile.dto.CandidateProfileResponseDTO;

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

    /**
     * GET /api/interviewer/interview-requests/{requestId}/history
     * Returns the candidate's application history for this request.
     * Only interviewers on the request's panel may read it.
     */
    @GetMapping("/{requestId}/history")
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<?> getHistory(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId) {
        try {
            CandidateHistoryResponseDTO result = service.getHistoryForInterviewer(jwt, requestId);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage() != null
                            ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }

    /**
     * GET /api/interviewer/interview-requests/{requestId}/candidate-profile
     * Returns the full candidate profile for this request.
     * Only interviewers on the request's panel may read it.
     */
    @GetMapping("/{requestId}/candidate-profile")
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<?> getCandidateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId) {
        try {
            CandidateProfileResponseDTO result =
                    service.getCandidateProfileForInterviewer(jwt, requestId);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage() != null
                            ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }

    /**
     * GET /api/interviewer/interview-requests/{requestId}/ai-question-score
     * Returns the candidate's AI interview question/answer history for this
     * request. Panel-gated equivalent of /api/company/ai-question-score, which
     * is restricted to company admins.
     */
    @GetMapping("/{requestId}/ai-question-score")
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<?> getAiQuestionScores(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId) {
        try {
            List<AiQuestionScoreDTO> result =
                    service.getAiQuestionScoresForInterviewer(jwt, requestId);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403)
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", e.getMessage() != null
                            ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }
}