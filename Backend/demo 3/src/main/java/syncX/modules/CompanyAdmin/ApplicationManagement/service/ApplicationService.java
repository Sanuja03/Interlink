package syncX.modules.CompanyAdmin.ApplicationManagement.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;
import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.DTO.ApplicationResponseDTO;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    private Set<Long> fetchInterviewedAppIds(List<Long> appIds) {
        if (appIds == null || appIds.isEmpty()) return Collections.emptySet();

        String placeholders = appIds.stream()
                .map(id -> "?")
                .collect(Collectors.joining(", "));

        String sql = "SELECT DISTINCT job_application_id " +
                "FROM interview_requests " +
                "WHERE job_application_id IN (" + placeholders + ") " +
                "AND status IN ('pending', 'finalized')";

        List<Long> rows = jdbc.queryForList(sql, Long.class, appIds.toArray());
        return new HashSet<>(rows);
    }

    private String resolveStatus(String rawStatus, boolean hasInterview) {
        if ("REJECTED".equals(rawStatus)) return "REJECTED";
        if (hasInterview) return "INTERVIEW";
        return rawStatus;
    }

    public List<ApplicationResponseDTO> getApplications(UUID companyId) {
        List<Application> applications = repository.findByCompanyId(companyId);

        List<Long> appIds = applications.stream()
                .map(Application::getId)
                .collect(Collectors.toList());

        Set<Long> interviewedIds = fetchInterviewedAppIds(appIds);

        return applications.stream().map(app -> {
            ApplicationResponseDTO dto = new ApplicationResponseDTO();
            dto.setId(app.getId());
            dto.setCandidateId(app.getCandidateId());
            dto.setCandidateName(app.getCandidateName());
            dto.setJobId(app.getJobId());
            dto.setJobTitle(app.getJobTitle());
            dto.setAiScore(app.getScore());
            dto.setScoreDetails(app.getScoreDetails());
            dto.setStatus(resolveStatus(app.getStatus(), interviewedIds.contains(app.getId())));
            dto.setResumeUrl(app.getResumeUrl());
            return dto;
        }).collect(Collectors.toList());
    }

    public ApplicationResponseDTO getApplicationDetail(Long applicationId) {
        Application app = repository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Set<Long> interviewedIds = fetchInterviewedAppIds(List.of(applicationId));

        ApplicationResponseDTO dto = new ApplicationResponseDTO();
        dto.setId(app.getId());
        dto.setCandidateId(app.getCandidateId());
        dto.setCandidateName(app.getCandidateName());
        dto.setJobId(app.getJobId());
        dto.setJobTitle(app.getJobTitle());
        dto.setAiScore(app.getScore());
        dto.setScoreDetails(app.getScoreDetails());
        dto.setStatus(resolveStatus(app.getStatus(), interviewedIds.contains(applicationId)));
        dto.setResumeUrl(app.getResumeUrl());
        return dto;
    }

    public void rejectApplication(Long applicationId, UUID companyId) {
        int count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM job_applications WHERE id = ? AND \"Company_Id\" = ?",
                Integer.class, applicationId, companyId);

        if (count == 0) {
            throw new RuntimeException("Application not found or does not belong to this company");
        }

        jdbc.update("UPDATE job_applications SET status = 'REJECTED' WHERE id = ?", applicationId);
    }
}