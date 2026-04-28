package syncX.modules.jobapply.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.jobapply.dto.CandidatePrefillDTO;
import syncX.modules.jobapply.dto.JobApplicationRequest;
import syncX.modules.jobapply.dto.JobApplicationResponse;
import syncX.modules.jobapply.service.JobApplicationService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for the job application feature.
 *
 * Base path: /api/candidate/applications  (secured to ROLE_candidate in SecurityConfig)
 *
 * Endpoints:
 *   GET  /api/candidate/applications/prefill              → pre-fill form with candidate data
 *   POST /api/candidate/applications                      → submit application (multipart)
 *   GET  /api/candidate/applications                      → list all my applications
 *   GET  /api/candidate/applications/{id}                 → get single application
 */
@RestController
@RequestMapping("/api/candidate/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationService service;

    // ── Helper ────────────────────────────────────────────────────────────────────

    /** Extracts the Supabase user_id from the JWT 'sub' claim. */
    private UUID extractUserId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    // ── GET /prefill ──────────────────────────────────────────────────────────────

    /**
     * Returns candidate data for pre-filling the application form.
     * Fields that are null/blank in the response must be entered manually by the candidate.
     */
    @GetMapping("/prefill")
    public ResponseEntity<?> getPrefill(@AuthenticationPrincipal Jwt jwt) {
        try {
            UUID userId = extractUserId(jwt);
            CandidatePrefillDTO dto = service.getPrefillData(userId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching prefill data: " + e.getMessage()));
        }
    }

    // ── POST / (multipart) ────────────────────────────────────────────────────────

    /**
     * Submits a job application.
     * Accepts multipart/form-data:
     *   - "application" (JSON part): JobApplicationRequest
     *   - "resume"      (file part): PDF file (optional but strongly recommended)
     *
     * Returns 201 Created with the saved JobApplicationResponse.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> apply(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("application") JobApplicationRequest request,
            @RequestPart(value = "resume", required = false) MultipartFile resumeFile) {
        try {
            UUID userId = extractUserId(jwt);
            JobApplicationResponse response = service.apply(userId, request, resumeFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error submitting application: " + e.getMessage()));
        }
    }

    // ── GET / ─────────────────────────────────────────────────────────────────────

    /**
     * Returns all job applications submitted by the logged-in candidate.
     */
    @GetMapping
    public ResponseEntity<?> getMyApplications(@AuthenticationPrincipal Jwt jwt) {
        try {
            UUID userId = extractUserId(jwt);
            List<JobApplicationResponse> list = service.getMyApplications(userId);
            return ResponseEntity.ok(list);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching applications: " + e.getMessage()));
        }
    }

    // ── GET /{id} ─────────────────────────────────────────────────────────────────

    /**
     * Returns a single job application by ID.
     * Returns 403 if the application does not belong to the logged-in candidate.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        try {
            UUID userId = extractUserId(jwt);
            JobApplicationResponse response = service.getApplicationById(userId, id);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching application: " + e.getMessage()));
        }
    }
}
