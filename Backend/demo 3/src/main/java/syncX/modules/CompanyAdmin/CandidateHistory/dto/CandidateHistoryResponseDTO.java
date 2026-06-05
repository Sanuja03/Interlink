package syncX.modules.CompanyAdmin.CandidateHistory.dto;

import java.util.List;
import java.util.UUID;

public class CandidateHistoryResponseDTO {

    private UUID candidateId;
    private String candidateName;
    private String jobTitle;
    private Long jobApplicationId;
    private Double aiScore;          // Single overall AI score shown at top
    private String currentStatus;    // Current status from job_applications
    private List<HistoryStageDTO> stages;

    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getJobApplicationId() { return jobApplicationId; }
    public void setJobApplicationId(Long jobApplicationId) { this.jobApplicationId = jobApplicationId; }

    public Double getAiScore() { return aiScore; }
    public void setAiScore(Double aiScore) { this.aiScore = aiScore; }

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }

    public List<HistoryStageDTO> getStages() { return stages; }
    public void setStages(List<HistoryStageDTO> stages) { this.stages = stages; }
}