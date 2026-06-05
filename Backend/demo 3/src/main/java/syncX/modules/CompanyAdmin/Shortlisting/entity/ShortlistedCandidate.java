package syncX.modules.CompanyAdmin.Shortlisting.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shortlisted_candidates")
public class ShortlistedCandidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "job_application_id")
    private Long jobApplicationId;

    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "ai_score")
    private Double aiScore;

    @Column(name = "ai_suggestion")
    private String aiSuggestion;

    @Column(name = "manual_decision")
    private String manualDecision;

    @Column(name = "manual_notes")
    private String manualNotes;

    @Column(name = "final_status")
    private String finalStatus;

    @Column(name = "status")
    private String status;

    @Column(name = "shortlisted_at")
    private LocalDateTime shortlistedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }
    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }
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
    public LocalDateTime getShortlistedAt() { return shortlistedAt; }
    public void setShortlistedAt(LocalDateTime shortlistedAt) { this.shortlistedAt = shortlistedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}