package syncX.modules.CompanyAdmin.AiQuestionScore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.AiQuestionScore.dto.AiQuestionScoreDTO;
import syncX.modules.CompanyAdmin.AiQuestionScore.service.AiQuestionScoreService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/company/ai-question-score")
public class AiQuestionScoreController {

    private final AiQuestionScoreService service;

    public AiQuestionScoreController(AiQuestionScoreService service) {
        this.service = service;
    }

    /**
     * Returns the AI interview question/answer history for a candidate on a given job.
     * Used by both the Shortlisting page and the Candidate History page.
     */
    @GetMapping
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<AiQuestionScoreDTO>> getHistory(
            @RequestParam UUID candidateId,
            @RequestParam Long jobId) {
        return ResponseEntity.ok(service.getHistory(candidateId, jobId));
    }
}
