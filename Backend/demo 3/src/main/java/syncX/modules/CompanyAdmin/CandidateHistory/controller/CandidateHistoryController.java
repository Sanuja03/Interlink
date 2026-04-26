package syncX.modules.CompanyAdmin.CandidateHistory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.CandidateHistory.dto.CandidateHistoryResponseDTO;
import syncX.modules.CompanyAdmin.CandidateHistory.service.CandidateHistoryService;

@RestController
@RequestMapping("/api/company/history")
public class CandidateHistoryController {

    private final CandidateHistoryService historyService;

    public CandidateHistoryController(CandidateHistoryService historyService) {
        this.historyService = historyService;
    }

    // GET history by job application ID
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<CandidateHistoryResponseDTO> getHistory(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(historyService.getHistoryByApplication(applicationId));
    }
}