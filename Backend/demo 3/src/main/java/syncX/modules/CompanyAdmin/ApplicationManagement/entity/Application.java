package syncX.modules.CompanyAdmin.ApplicationManagement.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "`Company_Id`")
    private UUID companyId;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "score")
    private Double score;

    @Column(name = "score_details", columnDefinition = "jsonb")
    private String scoreDetails;

    @Column(name = "status")
    private String status;

    // Getters & Setters
    public Long getId() { return id; }

    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }

    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getScoreDetails() { return scoreDetails; }
    public void setScoreDetails(String scoreDetails) { this.scoreDetails = scoreDetails; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}