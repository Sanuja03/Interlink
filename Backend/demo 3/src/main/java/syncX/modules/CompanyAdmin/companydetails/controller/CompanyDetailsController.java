package syncX.modules.CompanyAdmin.companydetails.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import syncX.modules.CompanyAdmin.companydetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.companydetails.service.CompanyDetailsService;

import java.util.UUID;

@RestController
@RequestMapping("/api/company/details")
@CrossOrigin(origins = "http://localhost:5175")
public class CompanyDetailsController {

    @Autowired
    private CompanyDetailsService service;

    // =========================================
    // 🔹 GET COMPANY DETAILS
    // =========================================
    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyDetails> getCompanyDetails(@PathVariable UUID companyId) {

        CompanyDetails details = service.getDetails(companyId);
        return ResponseEntity.ok(details);
    }

    // =========================================
    // 🔹 UPDATE COMPANY DETAILS
    // (updates BOTH companies + company_details)
    // =========================================
    @PutMapping("/{companyId}")
    public ResponseEntity<CompanyDetails> updateCompanyDetails(
            @PathVariable UUID companyId,
            @RequestBody CompanyDetails data) {

        CompanyDetails updatedDetails = service.updateDetails(companyId, data);
        return ResponseEntity.ok(updatedDetails);
    }

    // =========================================
    // 🔹 CREATE COMPANY DETAILS (OPTIONAL)
    // =========================================
    @PostMapping("/{companyId}")
    public ResponseEntity<CompanyDetails> createCompanyDetails(
            @PathVariable UUID companyId,
            @RequestBody CompanyDetails data) {

        CompanyDetails created = service.updateDetails(companyId, data);
        return ResponseEntity.ok(created);
    }

    // =========================================
    // 🔹 DELETE COMPANY (BOTH TABLES 🔥)
    // =========================================
    @DeleteMapping("/{companyId}")
    public ResponseEntity<String> deleteCompanyDetails(@PathVariable UUID companyId) {

        service.deleteDetails(companyId);
        return ResponseEntity.ok("✅ Company and CompanyDetails deleted successfully");
    }
}