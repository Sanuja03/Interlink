package syncX.modules.candidatedashboard.entity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Foreign Keys ──────────────────────────────────
    @Column(name = "candidate_id")
    private UUID candidateId;
    
    @Column(name = "company_id")
    private UUID companyId;
    @Column(name = "job_id")
    private Long jobId;

    // ── Auto-filled from candidates table ─────────────
    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    // ── Application-specific fields (Candidate Input) ─
    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    // ── Recruiter / Dashboard Fields (NOT inserted during apply) ─
    @Column(name = "status", insertable = false, updatable = true)
    private String status;

    @Column(name = "interview_date", insertable = false, updatable = true)
    private LocalDate interviewDate;

    @Column(name = "shortlisted_date", insertable = false, updatable = true)
    private LocalDate shortlistedDate;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "company")
    private String company;

    @Column(name = "result", insertable = false, updatable = true)
    private String result;

    @Column(name = "score", insertable = false, updatable = true)
    private Double score;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "score_details", columnDefinition = "jsonb", insertable = false, updatable = true)
    private Map<String, Object> scoreDetails;
}
