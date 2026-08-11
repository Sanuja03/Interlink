package syncX.modules.CompanyAdmin.CompanyDetails.controller;

import syncX.modules.CompanyAdmin.CompanyDetails.dto.CompanyDetailsUpdateRequest;
import syncX.modules.CompanyAdmin.CompanyDetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.CompanyDetails.service.CompanyDetailsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyDetailsController {

    private static final Logger log = LoggerFactory.getLogger(CompanyDetailsController.class);

    private final CompanyDetailsService companyDetailsService;


    @GetMapping("/{companyId}/details")
    public ResponseEntity<CompanyDetails> getDetails(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyDetailsService.getCompanyDetails(companyId));
    }


    @PutMapping("/{companyId}/details")
    public ResponseEntity<CompanyDetails> updateDetails(
            @PathVariable UUID companyId,
            @RequestBody CompanyDetailsUpdateRequest request) {

        // TEMP DEBUG — confirms exactly what the backend received.
        // Remove once the bug is confirmed fixed.
        log.info("PUT /company/{}/details -- incoming companyLocation = [{}]",
                companyId, request.getCompanyLocation());

        CompanyDetails updated = companyDetailsService
                .updateCompanyDetails(companyId, request, null);

        // TEMP DEBUG — confirms exactly what got persisted/returned after save.
        log.info("PUT /company/{}/details -- saved companyLocation = [{}]",
                companyId, updated.getCompanyLocation());

        return ResponseEntity.ok(updated);
    }


    @PostMapping("/{companyId}/logo")
    public ResponseEntity<CompanyDetails> uploadLogo(
            @PathVariable UUID companyId,
            @RequestParam("logo") MultipartFile logoFile) {
        CompanyDetails updated = companyDetailsService
                .updateLogo(companyId, logoFile);
        return ResponseEntity.ok(updated);
    }
}