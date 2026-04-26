package syncX.modules.CompanyAdmin.ApplicationManagement.DTO;

import java.util.UUID;

public class ApplicationResponseDTO {

    private Long id;

    private UUID candidateId;
    private String candidateName;

    // 🔥 FIX: must match Entity (Long)
    private Long jobId;

    private String jobTitle;

    private Double aiScore;

    private String status;

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(UUID candidateId) {
        this.candidateId = candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public Long getJobId() { // ✅ FIXED
        return jobId;
    }

    public void setJobId(Long jobId) { // ✅ FIXED
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public Double getAiScore() {
        return aiScore;
    }

    public void setAiScore(Double aiScore) {
        this.aiScore = aiScore;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}