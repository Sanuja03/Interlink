package syncX.modules.candidatedashboard.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "job_title")
    private String jobTitle;

    // 🔥 FINAL FIX (String → UUID)
    @Column(name = "\"Company_Id\"", nullable = false)
    private UUID company;

    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    @Column(name = "shortlisted_date")
    private LocalDate shortlistedDate;

    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Column(name = "status")
    private String status;

    @Column(name = "score")
    private Double score;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "result")
    private String result;
}