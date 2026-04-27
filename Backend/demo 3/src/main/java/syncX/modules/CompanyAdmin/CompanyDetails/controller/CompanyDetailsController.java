package syncX.modules.CompanyAdmin.CompanyDetails.controller;

import syncX.modules.CompanyAdmin.CompanyDetails.dto.CompanyDetailsUpdateRequest;
import syncX.modules.CompanyAdmin.CompanyDetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.CompanyDetails.service.CompanyDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyDetailsController {

    private final CompanyDetailsService companyDetailsService;

    @GetMapping("/{companyId}/details")
    public ResponseEntity<CompanyDetails> getDetails(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyDetailsService.getCompanyDetails(companyId));
    }

    @PutMapping("/{companyId}/details")
    public ResponseEntity<CompanyDetails> updateDetails(
            @PathVariable UUID companyId,
            @RequestBody CompanyDetailsUpdateRequest request) {
        CompanyDetails updated = companyDetailsService
                .updateCompanyDetails(companyId, request, null);
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