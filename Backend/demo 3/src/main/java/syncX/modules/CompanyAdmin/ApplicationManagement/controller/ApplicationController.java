package syncX.modules.CompanyAdmin.ApplicationManagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.ApplicationManagement.service.ApplicationService;
import syncX.modules.CompanyAdmin.ApplicationManagement.DTO.ApplicationResponseDTO;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.repository.CompanyRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/company/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Autowired
    private CompanyRepository companyRepository;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * GET /api/company/applications/{companyId}
     * Kept for backward compatibility with frontend.
     */
    @GetMapping("/{companyId}")
    public List<ApplicationResponseDTO> getApplications(@PathVariable UUID companyId) {
        return applicationService.getApplications(companyId);
    }

    /**
     * GET /api/company/applications/detail/{applicationId}
     */
    @GetMapping("/detail/{applicationId}")
    public ApplicationResponseDTO getApplicationDetail(@PathVariable Long applicationId) {
        return applicationService.getApplicationDetail(applicationId);
    }

    /**
     * POST /api/company/applications/{applicationId}/reject
     * Rejects an application using raw SQL (avoids Company_Id issue).
     */
    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<Map<String, String>> rejectApplication(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long applicationId) {

        UUID companyId = resolveCompanyId(jwt);
        applicationService.rejectApplication(applicationId, companyId);
        return ResponseEntity.ok(Map.of("message", "Application rejected", "status", "REJECTED"));
    }

    private UUID resolveCompanyId(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return company.getCompanyId();
    }
}