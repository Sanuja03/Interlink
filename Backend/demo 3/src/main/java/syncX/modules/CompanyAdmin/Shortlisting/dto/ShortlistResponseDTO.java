package syncX.modules.CompanyAdmin.Shortlisting.dto;

import java.util.UUID;

public class ShortlistResponseDTO {
    private Long shortlistId;
    private UUID candidateId;
    private String candidateName;
    private Long jobId;
    private String jobPostId;          // NEW: synthesized as "JOB" + jobId so the React popups can show it.
    private String jobTitle;
    private Long jobApplicationId;
    private Long historyId;
    private Double aiScore;
    private String aiSuggestion;
    private String manualDecision;
    private String manualNotes;
    private String finalStatus;
    private String status;
    private String shortlistedAt;

    public Long getShortlistId() { return shortlistId; }
    public void setShortlistId(Long shortlistId) { this.shortlistId = shortlistId; }

    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobPostId() { return jobPostId; }
    public void setJobPostId(String jobPostId) { this.jobPostId = jobPostId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getJobApplicationId() { return jobApplicationId; }
    public void setJobApplicationId(Long jobApplicationId) { this.jobApplicationId = jobApplicationId; }

    public Long getHistoryId() { return historyId; }
    public void setHistoryId(Long historyId) { this.historyId = historyId; }

    public Double getAiScore() { return aiScore; }
    public void setAiScore(Double aiScore) { this.aiScore = aiScore; }

    public String getAiSuggestion() { return aiSuggestion; }
    public void setAiSuggestion(String aiSuggestion) { this.aiSuggestion = aiSuggestion; }

    public String getManualDecision() { return manualDecision; }
    public void setManualDecision(String manualDecision) { this.manualDecision = manualDecision; }

    public String getManualNotes() { return manualNotes; }
    public void setManualNotes(String manualNotes) { this.manualNotes = manualNotes; }

    public String getFinalStatus() { return finalStatus; }
    public void setFinalStatus(String finalStatus) { this.finalStatus = finalStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getShortlistedAt() { return shortlistedAt; }
    public void setShortlistedAt(String shortlistedAt) { this.shortlistedAt = shortlistedAt; }
}