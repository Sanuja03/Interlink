package syncX.modules.CompanyAdmin.InterviewSummary.controller;

import syncX.modules.CompanyAdmin.InterviewSummary.dto.DecisionRequestDTO;
import syncX.modules.CompanyAdmin.InterviewSummary.dto.InterviewSummaryRowDTO;
import syncX.modules.CompanyAdmin.InterviewSummary.service.InterviewSummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/interview-summary")
@CrossOrigin(origins = "*")
public class InterviewSummaryController {

    private final InterviewSummaryService service;

    public InterviewSummaryController(InterviewSummaryService service) {
        this.service = service;
    }


    @GetMapping
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<InterviewSummaryRowDTO>> getList(
            @RequestParam UUID companyId) {

        return ResponseEntity.ok(service.getInterviewList(companyId));
    }


    @PostMapping("/decide")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<Map<String, String>> decide(
            @RequestBody DecisionRequestDTO request,
            @RequestParam UUID companyId) {

        String message = service.applyDecision(
                request.getScheduledId(),
                companyId,
                request.getDecision());

        return ResponseEntity.ok(Map.of("message", message));
    }
}