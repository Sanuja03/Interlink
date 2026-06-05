package syncX.modules.CompanyAdmin.ApplicationManagement.service;

import org.springframework.jdbc.core.JdbcTemplate;
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
    private final JdbcTemplate jdbc;

    public ApplicationService(ApplicationRepository repository, JdbcTemplate jdbc) {
        this.repository = repository;
        this.jdbc = jdbc;
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
            dto.setScoreDetails(app.getScoreDetails());
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
        dto.setScoreDetails(app.getScoreDetails());
        dto.setStatus(app.getStatus());
        return dto;
    }

    /**
     * Reject an application using raw SQL to avoid the Company_Id column issue.
     * Validates that the application belongs to the given company.
     */
    public void rejectApplication(Long applicationId, UUID companyId) {
        // Verify the application belongs to this company
        int count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM job_applications WHERE id = ? AND \"Company_Id\" = ?",
                Integer.class, applicationId, companyId);

        if (count == 0) {
            throw new RuntimeException("Application not found or does not belong to this company");
        }

        jdbc.update("UPDATE job_applications SET status = 'REJECTED' WHERE id = ?", applicationId);
    }
}