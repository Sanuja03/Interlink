package syncX.modules.CompanyAdmin.ApplicationManagement.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ matches DB: Company_Id (UUID)
    @Column(name = "\"Company_Id\"")
    private UUID companyId;

    // ✅ UUID (correct)
    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "candidate_name")
    private String candidateName;

    // 🔥 FIX: DB = bigint → MUST be Long (NOT UUID)
    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "job_title")
    private String jobTitle;

    // 🔥 FIX: DB = double precision → MUST be Double (NOT int)
    @Column(name = "score")
    private Double score;

    @Column(name = "status")
    private String status;

    // =====================
    // GETTERS & SETTERS
    // =====================

    public Long getId() {
        return id;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
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

    // 🔥 FIXED TYPE
    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    // 🔥 FIXED TYPE
    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}