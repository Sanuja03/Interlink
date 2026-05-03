package syncX.modules.SuperAdmin.Admin_jobs.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import syncX.modules.SuperAdmin.Admin_jobs.dto.AdminJobListDto;
import syncX.modules.SuperAdmin.Admin_jobs.service.AdminJobService;

@RestController
@RequestMapping("/api/admin/jobs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminJobController {

    // Service layer for job-related business logic
    private final AdminJobService service;

    // Get paginated jobs with filters
    @GetMapping
    public ResponseEntity<?> getJobs(
            @RequestParam(defaultValue = "") String search,   // Search keyword
            @RequestParam(defaultValue = "") String status,   // Filter by job status
            @RequestParam(defaultValue = "") String type,     // Filter by job type
            @RequestParam(defaultValue = "") String category, // Filter by category
            @RequestParam(defaultValue = "0") int page,       // Page number
            @RequestParam(defaultValue = "5") int size        // Page size
    ) {
        try {
            // Fetch filtered job list
            Page<AdminJobListDto> result = service.getJobs(search, status, type, category, page, size);

            // Return paginated response
            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            // Handle validation or service errors
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get detailed job information by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getJob(@PathVariable Long id) {
        try {
            // Fetch job details
            return ResponseEntity.ok(service.getJobDetails(id));

        } catch (RuntimeException e) {
            // Handle not found or validation errors
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Flag a job
    @PutMapping("/{id}/flag")
    public ResponseEntity<String> flag(@PathVariable Long id) {
        try {
            // Mark job as flagged
            service.flagJob(id);

            // Return success message
            return ResponseEntity.ok("Job flagged successfully");

        } catch (RuntimeException e) {
            // Handle business logic errors
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Remove flag from a job
    @PutMapping("/{id}/unflag")
    public ResponseEntity<String> unflag(@PathVariable Long id) {
        try {
            // Remove flagged status
            service.unflagJob(id);

            // Return success message
            return ResponseEntity.ok("Job unflagged successfully");

        } catch (RuntimeException e) {
            // Handle business logic errors
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Suspend a job
    @PutMapping("/{id}/suspend")
    public ResponseEntity<String> suspend(@PathVariable Long id) {
        try {
            // Suspend job
            service.suspendJob(id);

            // Return success message
            return ResponseEntity.ok("Job suspended successfully");

        } catch (RuntimeException e) {
            // Handle business logic errors
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Restore a suspended job
    @PutMapping("/{id}/restore")
    public ResponseEntity<String> restore(@PathVariable Long id) {
        try {
            // Restore job status
            service.restoreJob(id);

            // Return success message
            return ResponseEntity.ok("Job restored successfully");

        } catch (RuntimeException e) {
            // Handle business logic errors
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}