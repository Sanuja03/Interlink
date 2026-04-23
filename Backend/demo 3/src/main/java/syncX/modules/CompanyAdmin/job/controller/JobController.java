package syncX.modules.CompanyAdmin.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.job.entity.Job;
import syncX.modules.CompanyAdmin.job.service.JobService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/company/jobs")
@CrossOrigin("*")
public class JobController {

    @Autowired
    private JobService jobService;

    // ✅ CREATE JOB
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        try {
            // 🔥 Basic validation
            if (job.getJobTitle() == null || job.getJobTitle().isEmpty()) {
                return ResponseEntity.badRequest().body("Job title is required");
            }

            if (job.getCompanyId() == null) {
                return ResponseEntity.badRequest().body("Company ID is required");
            }

            Job savedJob = jobService.createJob(job);
            return ResponseEntity.ok(savedJob);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating job: " + e.getMessage());
        }
    }

    // ✅ GET ALL JOBS
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // ✅ GET JOBS BY COMPANY
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Job>> getJobsByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(jobService.getJobsByCompany(companyId));
    }

    // ✅ GET JOB BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        try {
            Job job = jobService.getJobById(id);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Job not found");
        }
    }

    // ✅ UPDATE JOB
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job job) {
        try {
            Job updatedJob = jobService.updateJob(id, job);
            return ResponseEntity.ok(updatedJob);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating job: " + e.getMessage());
        }
    }

    // ✅ TOGGLE JOB STATUS (OPEN ↔ CLOSED)
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleJob(@PathVariable Long id) {
        try {
            Job updatedJob = jobService.toggleJobStatus(id);
            return ResponseEntity.ok(updatedJob);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error toggling status: " + e.getMessage());
        }
    }

    // ✅ DELETE JOB
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        try {
            jobService.deleteJob(id);
            return ResponseEntity.ok("Job deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting job");
        }
    }
}