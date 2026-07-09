package syncX.modules.SuperAdmin.Admin_interviews.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import syncX.modules.SuperAdmin.Admin_interviews.dto.AdminInterviewDto;
import syncX.modules.SuperAdmin.Admin_interviews.dto.AdminInterviewCandidateDto;
import syncX.modules.SuperAdmin.Admin_interviews.service.AdminInterviewService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/interviews")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminInterviewController {

    private final AdminInterviewService service;

    // Get interviews with pagination + filters
    @GetMapping
    public Page<AdminInterviewDto> getInterviews(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.getInterviews(search, status, page, size);
    }

    // Get total count
    @GetMapping("/count")
    public long getCount() {
        return service.getTotalCount();
    }

    // Get candidate profile by ID
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<?> getCandidate(@PathVariable UUID candidateId) {

        AdminInterviewCandidateDto candidate = service.getCandidateById(candidateId);

        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Candidate not found"));
        }

        return ResponseEntity.ok(candidate);
    }
}