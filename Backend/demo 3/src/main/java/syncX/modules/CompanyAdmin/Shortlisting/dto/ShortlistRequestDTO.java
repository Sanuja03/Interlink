package syncX.modules.CompanyAdmin.Shortlisting.dto;

import java.util.UUID;

public class ShortlistRequestDTO {
    private UUID candidateId;
    private UUID companyId;
    private Long jobId;
    private Long jobApplicationId;
    private String manualDecision;
    private String manualNotes;

    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }

    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getJobApplicationId() { return jobApplicationId; }
    public void setJobApplicationId(Long jobApplicationId) { this.jobApplicationId = jobApplicationId; }

    public String getManualDecision() { return manualDecision; }
    public void setManualDecision(String manualDecision) { this.manualDecision = manualDecision; }

    public String getManualNotes() { return manualNotes; }
    public void setManualNotes(String manualNotes) { this.manualNotes = manualNotes; }
}