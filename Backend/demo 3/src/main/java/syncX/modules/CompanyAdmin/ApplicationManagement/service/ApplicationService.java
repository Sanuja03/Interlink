package syncX.modules.CompanyAdmin.ApplicationManagement.service;

import org.springframework.stereotype.Service;

import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;
import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.DTO.ApplicationResponseDTO;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository repository;

    // ✅ Constructor Injection
    public ApplicationService(ApplicationRepository repository) {
        this.repository = repository;
    }

    // 🔹 GET ALL APPLICATIONS FOR COMPANY
    public List<ApplicationResponseDTO> getApplications(UUID companyId) {

        List<Application> applications = repository.findByCompanyId(companyId);

        return applications.stream().map(app -> {

            ApplicationResponseDTO dto = new ApplicationResponseDTO();

            dto.setId(app.getId());
            dto.setCandidateId(app.getCandidateId());
            dto.setCandidateName(app.getCandidateName());

            // 🔥 FIX: Entity = Long → convert to UUID or change DTO (recommended below)
            dto.setJobId(app.getJobId()); // ⚠ TEMP (see note below)

            dto.setJobTitle(app.getJobTitle());

            // 🔥 FIX: already Double → no need valueOf
            dto.setAiScore(app.getScore());

            dto.setStatus(app.getStatus());

            return dto;

        }).collect(Collectors.toList());
    }
}