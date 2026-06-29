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
     * Get assignable interviewers for a given date whejn filling the request form
     * and recives as split "available" and "other" for that date
     */
    @GetMapping("/assignable")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<InterviewRequestDTO.AssignableInterviewersResponse> getAssignable(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String date) {

        return ResponseEntity.ok(service.getAssignable(jwt, date));
    }

    /**
     * check whether the candidate with the job applicationid already has a request form
     * Returns 204 No Content if nothing exists yet — frontend treats that as "fresh form".
     * historyId (optional) scopes the lookup to a specific round so Round 2 is not
     * blocked by a completed Round 1 request.
     * GET /api/company/interview-requests/current?candidateId=UUID&jobApplicationId=123&historyId=456
     */
    @GetMapping("/current")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<InterviewRequestDTO.ExistingRequestResponse> getCurrent(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam UUID candidateId,
            @RequestParam Long jobApplicationId,
            @RequestParam(required = false) Long historyId) {  // optional — round scope

        InterviewRequestDTO.ExistingRequestResponse existing =
                service.getExistingRequest(jwt, candidateId, jobApplicationId, historyId);

        if (existing == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(existing);
    }

    /**
     * Create a new interview request. If a non-cancelled one exists for this
     * (candidate, application), it is auto-cancelled first (Edit → resend flow).
     * POST /api/company/interview-requests
     */
    @PostMapping
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<InterviewRequestDTO.CreateResponse> createRequest(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody InterviewRequestDTO.CreateRequest request) {

        return ResponseEntity.ok(service.createRequest(jwt, request));
    }

    /**get all interview requests belonging to the admin's company with two optional query parameters that act as filters:
     *all interviewers,filtered by job post*/
    @GetMapping
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<InterviewRequestDTO.ExistingRequestResponse>> listMine(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long jobApplicationId,
            @RequestParam(required = false) Long jobId) {

        return ResponseEntity.ok(service.listForCompany(jwt, jobApplicationId, jobId));
    }
}