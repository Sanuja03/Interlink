package syncX.modules.CompanyAdmin.ApplicationManagement.controller;

import org.springframework.web.bind.annotation.*;

import syncX.modules.CompanyAdmin.ApplicationManagement.service.ApplicationService;
import syncX.modules.CompanyAdmin.ApplicationManagement.DTO.ApplicationResponseDTO;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/company/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    // ✅ Constructor Injection
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // 🔹 GET ALL APPLICATIONS BY COMPANY ID
    @GetMapping("/{companyId}")
    public List<ApplicationResponseDTO> getApplications(@PathVariable UUID companyId) {
        return applicationService.getApplications(companyId);
    }
}