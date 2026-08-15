package syncX.modules.CompanyAdmin.AiQuestionScore.dto;

import java.util.List;
import java.util.UUID;

public class AiQuestionScoreDTO {

    private Long id;
    private UUID candidateId;
    private Long jobId;
    private Integer score;              // overall score for this AI interview session (0-100)
    private boolean recommended;        // score > 70
    private String savedAt;             // formatted date/time
    private List<QaPairDTO> qaPairs;    // individual question/answer pairs for this session

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public boolean isRecommended() { return recommended; }
    public void setRecommended(boolean recommended) { this.recommended = recommended; }

    public String getSavedAt() { return savedAt; }
    public void setSavedAt(String savedAt) { this.savedAt = savedAt; }

    public List<QaPairDTO> getQaPairs() { return qaPairs; }
    public void setQaPairs(List<QaPairDTO> qaPairs) { this.qaPairs = qaPairs; }
}
