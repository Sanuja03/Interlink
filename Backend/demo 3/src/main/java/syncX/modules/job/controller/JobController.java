package syncX.modules.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.job.dto.JobRequestDto;
import syncX.modules.job.service.JobService;

@RestController
@CrossOrigin("*")
public class JobController {

    @Autowired
    private JobService jobService;

    /**
     * Used by  AI module
     */
    @PostMapping("/api/jobs")
    public ResponseEntity<?> createWithAI(@RequestBody JobRequestDto dto) {
        try {
            return ResponseEntity.ok(jobService.createJob(dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    /**
     * Used by the frontend CreateJob form
     * Maps to /company/jobs/create
     */
    @PostMapping("/company/jobs/create")
    public ResponseEntity<?> createFromFrontend(@RequestBody JobRequestDto dto) {
        try {
            return ResponseEntity.ok(jobService.createJob(dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}