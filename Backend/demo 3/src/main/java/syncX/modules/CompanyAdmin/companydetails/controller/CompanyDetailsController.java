package syncX.modules.CompanyAdmin.companydetails.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.companydetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.companydetails.service.CompanyDetailsService;

import java.util.UUID;

@RestController
@RequestMapping("/api/company/details") // 🔥 FIX: added /api prefix to match SecurityConfig
@CrossOrigin(origins = "http://localhost:5175")
public class CompanyDetailsController {

    @Autowired
    private CompanyDetailsService service;

    // 🔥 GET COMPANY DETAILS
    @GetMapping("/{companyId}")
    public ResponseEntity<?> getDetails(@PathVariable UUID companyId) {
        try {
            CompanyDetails details = service.getDetails(companyId);
            return ResponseEntity.ok(details);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // 🔥 UPDATE COMPANY DETAILS (ONLY company_details table)
    @PutMapping("/{companyId}")
    public ResponseEntity<?> updateDetails(
            @PathVariable UUID companyId,
            @RequestBody CompanyDetails data) {

        try {
            CompanyDetails updated = service.updateDetails(companyId, data);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}