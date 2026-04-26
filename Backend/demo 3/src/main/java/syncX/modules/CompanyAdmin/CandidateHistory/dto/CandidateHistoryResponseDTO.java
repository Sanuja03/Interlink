package syncX.modules.CompanyAdmin.CandidateHistory.dto;

import java.util.List;
import java.util.UUID;

public class CandidateHistoryResponseDTO {

    private UUID candidateId;
    private String candidateName;
    private String jobTitle;
    private Long jobApplicationId;
    private Double aiScore;
    private List<HistoryStageDTO> stages;

    // Getters & Setters
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

    public List<HistoryStageDTO> getStages() { return stages; }
    public void setStages(List<HistoryStageDTO> stages) { this.stages = stages; }
}