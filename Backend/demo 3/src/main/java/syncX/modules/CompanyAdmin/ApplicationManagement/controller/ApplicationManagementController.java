package syncX.modules.CompanyAdmin.ApplicationManagement.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.*;

import syncX.modules.candidatedashboard.entity.JobApplication;
import syncX.modules.CompanyAdmin.ApplicationManagement.service.ApplicationManagementService;

@RestController
@RequestMapping("/api/company/applications")
@CrossOrigin(origins = "*")
public class ApplicationManagementController {

    @Autowired
    private ApplicationManagementService service;

    /**
     * 🔹 Get all applications
     */
    @GetMapping("/{companyId}")
    public ResponseEntity<?> getApplications(@PathVariable String companyId) {
        try {
            List<JobApplication> applications = service.getApplications(companyId);
            return ResponseEntity.ok(applications);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Server error while fetching applications");
        }
    }

    /**
     * 🔹 Get summary
     */
    @GetMapping("/summary/{companyId}")
    public ResponseEntity<?> getSummary(@PathVariable String companyId) {
        try {
            Map<String, Long> summary = service.getSummary(companyId);
            return ResponseEntity.ok(summary);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Server error while fetching summary");
        }
    }

    /**
     * 🔹 Update status (ONLY reject part improved)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        try {
            // ✅ Normalize input (important)
            if (status != null) {
                status = status.trim();
            }

            // ✅ Only allow valid statuses
            if (!status.equals("Shortlisted") && !status.equals("Rejected")) {
                return ResponseEntity.badRequest().body("Invalid status value");
            }

            service.updateStatus(id, status);

            // 🔥 Better response for reject
            if (status.equals("Rejected")) {
                return ResponseEntity.ok("Application rejected successfully");
            }

            return ResponseEntity.ok("Status updated successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error updating status");
        }
    }
}