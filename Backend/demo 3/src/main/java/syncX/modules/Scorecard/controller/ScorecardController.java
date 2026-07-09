package syncX.modules.Scorecard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import syncX.modules.Scorecard.service.ScorecardService;

import java.util.*;

@RestController
@RequestMapping("/api/company/scorecards")
@PreAuthorize("hasRole('company_admin')")
public class ScorecardController {

    @Autowired
    private ScorecardService scorecardService;

    //gets the list of scorecards for each job and returns the list of score card for that job id
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long jobId) {
        return ResponseEntity.ok(scorecardService.listForJob(jwt, jobId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(scorecardService.create(jwt, body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(scorecardService.update(jwt, id, body));
    }

    @PatchMapping("/{id}/finalize")
    public ResponseEntity<Map<String, Object>> finalizeTemplate(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {// extracts the scorecard UUID from the URL path.
        return ResponseEntity.ok(scorecardService.finalizeTemplate(jwt, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        scorecardService.delete(jwt, id);
        return ResponseEntity.noContent().build();
    }
}