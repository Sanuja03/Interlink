package syncX.modules.InterviewProcess.InterviewRequest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import syncX.modules.InterviewProcess.InterviewRequest.dto.CompanyMeResponse;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.repository.CompanyRepository;

import java.util.UUID;

@RestController
@RequestMapping("/api/company")
public class CompanyMeController {

    @Autowired
    private CompanyRepository companyRepository;

    /**
     * GET /api/company/me
     * Returns the logged-in company admin's company info.
     * Used by the frontend to scope shortlisted candidates
     * to only those belonging to this company - ./api/auth/me
     * returns only user info (id, email, role) but NOT company details
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> getMyCompany(@AuthenticationPrincipal Jwt jwt) {

        UUID adminUserId = UUID.fromString(jwt.getSubject());

        Company company = companyRepository.findByUserId(adminUserId)
                .orElse(null);

        if (company == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new CompanyMeResponse(
                company.getCompanyId().toString(),
                company.getCompanyName(),
                company.getCompanyEmail()
        ));
    }
}