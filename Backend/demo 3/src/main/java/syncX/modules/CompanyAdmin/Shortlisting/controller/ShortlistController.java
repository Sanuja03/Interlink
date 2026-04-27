package syncX.modules.CompanyAdmin.Shortlisting.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.Shortlisting.dto.*;
import syncX.modules.CompanyAdmin.Shortlisting.service.ShortlistService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/company/shortlist")
public class ShortlistController {

    private final ShortlistService shortlistService;

    public ShortlistController(ShortlistService shortlistService) {
        this.shortlistService = shortlistService;
    }

    @PostMapping
    public ResponseEntity<ShortlistResponseDTO> shortlistCandidate(
            @RequestBody ShortlistRequestDTO request) {
        return ResponseEntity.ok(shortlistService.shortlistCandidate(request));
    }

    @PostMapping("/reject")
    public ResponseEntity<ShortlistResponseDTO> rejectCandidate(
            @RequestBody ShortlistRequestDTO request) {
        request.setManualDecision("Reject");
        return ResponseEntity.ok(shortlistService.rejectCandidate(request));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<ShortlistedByJobDTO>> getByCompany(
            @PathVariable UUID companyId) {
        return ResponseEntity.ok(shortlistService.getShortlistedByCompany(companyId));
    }

    @GetMapping("/company/{companyId}/job/{jobId}")
    public ResponseEntity<List<ShortlistResponseDTO>> getByJob(
            @PathVariable UUID companyId,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(shortlistService.getShortlistedByJob(companyId, jobId));
    }
}