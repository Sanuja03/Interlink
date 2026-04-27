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

    public ApplicationService(ApplicationRepository repository) {
        this.repository = repository;
    }

    public List<ApplicationResponseDTO> getApplications(UUID companyId) {

        List<Application> applications = repository.findByCompanyId(companyId);

        return applications.stream().map(app -> {
            ApplicationResponseDTO dto = new ApplicationResponseDTO();
            dto.setId(app.getId());
            dto.setCandidateId(app.getCandidateId());
            dto.setCandidateName(app.getCandidateName());
            dto.setJobId(app.getJobId());
            dto.setJobTitle(app.getJobTitle());
            dto.setAiScore(app.getScore());
            dto.setStatus(app.getStatus());
            return dto;
        }).collect(Collectors.toList());
    }

    public ApplicationResponseDTO getApplicationDetail(Long applicationId) {
        Application app = repository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        ApplicationResponseDTO dto = new ApplicationResponseDTO();
        dto.setId(app.getId());
        dto.setCandidateId(app.getCandidateId());
        dto.setCandidateName(app.getCandidateName());
        dto.setJobId(app.getJobId());
        dto.setJobTitle(app.getJobTitle());
        dto.setAiScore(app.getScore());
        dto.setStatus(app.getStatus());
        return dto;
    }
}