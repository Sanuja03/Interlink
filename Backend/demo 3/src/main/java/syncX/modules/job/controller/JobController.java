package syncX.modules.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.job.dto.JobRequestDto;
import syncX.modules.job.service.JobService;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin("*")
public class JobController {

    @Autowired
    private JobService jobService;

    // ================= CREATE =================

    @PostMapping
    public ResponseEntity<?> createWithAI(@RequestBody JobRequestDto dto) {
        try {
            return ResponseEntity.ok(jobService.createJob(dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/company/create")
    public ResponseEntity<?> createFromFrontend(@RequestBody JobRequestDto dto) {
        try {
            return ResponseEntity.ok(jobService.createJob(dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // ================= READ =================

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getJobsByCompany(@PathVariable String companyId) {
        try {
            return ResponseEntity.ok(jobService.getJobsByCompany(companyId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<?> getJobById(@PathVariable Long jobId) { // ✅ FIXED
        try {
            return ResponseEntity.ok(jobService.getJobById(String.valueOf(jobId)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // ================= UPDATE (🔥 NEW FIX) =================

    @PutMapping("/{jobId}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long jobId,
            @RequestBody JobRequestDto dto
    ) {
        try {
            return ResponseEntity.ok(jobService.updateJob(jobId, dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // ================= TOGGLE =================

    @PutMapping("/{jobId}/toggle")
    public ResponseEntity<?> toggleJobStatus(@PathVariable Long jobId) { // ✅ FIXED
        try {
            return ResponseEntity.ok(jobService.toggleJobStatus(String.valueOf(jobId)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // ================= DELETE =================

    @DeleteMapping("/{jobId}")
    public ResponseEntity<?> deleteJob(@PathVariable Long jobId) { // ✅ FIXED
        try {
            jobService.deleteJob(String.valueOf(jobId));
            return ResponseEntity.ok("Job deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}