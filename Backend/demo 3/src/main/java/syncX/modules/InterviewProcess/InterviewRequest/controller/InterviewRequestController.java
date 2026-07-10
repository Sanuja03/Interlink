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
@RequestMapping("/api/company/interview-requests")
public class InterviewRequestController {

    @Autowired
    private InterviewRequestService service;

    /**
     * GET /api/company/interview-requests/assignable?date=&time=&durationMinutes=
     * Returns three groups: available, other, unavailable (schedule conflict).
     */
    @GetMapping("/assignable")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<InterviewRequestDTO.AssignableInterviewersResponse> getAssignable(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String date,
            @RequestParam(required = false, defaultValue = "00:00") String time,
            @RequestParam(required = false, defaultValue = "60") int durationMinutes) {

        return ResponseEntity.ok(service.getAssignable(jwt, date, time, durationMinutes));
    }

    /**
     * GET /api/company/interview-requests/current?candidateId=UUID&jobApplicationId=123
     */
    @GetMapping("/current")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<InterviewRequestDTO.ExistingRequestResponse> getCurrent(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam UUID candidateId,
            @RequestParam Long jobApplicationId) {

        InterviewRequestDTO.ExistingRequestResponse existing =
                service.getExistingRequest(jwt, candidateId, jobApplicationId);

        if (existing == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(existing);
    }

    /**
     * POST /api/company/interview-requests
     */
    @PostMapping
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<InterviewRequestDTO.CreateResponse> createRequest(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody InterviewRequestDTO.CreateRequest request) {

        return ResponseEntity.ok(service.createRequest(jwt, request));
    }

    /**
     * GET /api/company/interview-requests/{requestId}
     * Single request by id — used by the finalize popup to inherit the stored location.
     */
    @GetMapping("/{requestId}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<InterviewRequestDTO.ExistingRequestResponse> getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId) {

        InterviewRequestDTO.ExistingRequestResponse r = service.getRequestById(jwt, requestId);
        if (r == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(r);
    }

    /**
     * GET /api/company/interview-requests
     */
    @GetMapping
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<InterviewRequestDTO.ExistingRequestResponse>> listMine(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long jobApplicationId,
            @RequestParam(required = false) Long jobId) {

        return ResponseEntity.ok(service.listForCompany(jwt, jobApplicationId, jobId));
    }
}