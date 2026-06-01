package syncX.modules.savedjobs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import syncX.modules.savedjobs.dto.SavedJobDTO;
import syncX.modules.savedjobs.service.SavedJobService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/saved-jobs")
public class SavedJobController {

    @Autowired
    private SavedJobService savedJobService;

    private UUID extractUserId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    @GetMapping
    public ResponseEntity<?> getSavedJobs(@AuthenticationPrincipal Jwt jwt) {
        try {
            UUID userId = extractUserId(jwt);
            List<SavedJobDTO> savedJobs = savedJobService.getSavedJobs(userId);
            return ResponseEntity.ok(savedJobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching saved jobs: " + e.getMessage()));
        }
    }

    @GetMapping("/ids")
    public ResponseEntity<?> getSavedJobIds(@AuthenticationPrincipal Jwt jwt) {
        try {
            UUID userId = extractUserId(jwt);
            List<Long> savedJobIds = savedJobService.getSavedJobIds(userId);
            return ResponseEntity.ok(savedJobIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching saved job IDs: " + e.getMessage()));
        }
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<?> saveJob(@AuthenticationPrincipal Jwt jwt, @PathVariable Long jobId) {
        try {
            UUID userId = extractUserId(jwt);
            savedJobService.saveJob(userId, jobId);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Job saved successfully"));
        } catch (RuntimeException e) {
            if ("Job already saved".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error saving job: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<?> unsaveJob(@AuthenticationPrincipal Jwt jwt, @PathVariable Long jobId) {
        try {
            UUID userId = extractUserId(jwt);
            savedJobService.unsaveJob(userId, jobId);
            return ResponseEntity.ok(Map.of("message", "Job unsaved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error unsaving job: " + e.getMessage()));
        }
    }
}
