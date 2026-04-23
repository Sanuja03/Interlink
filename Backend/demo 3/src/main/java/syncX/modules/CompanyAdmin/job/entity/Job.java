package syncX.modules.CompanyAdmin.job.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Job Title
    @Column(name = "job_title")
    private String jobTitle;

    // ✅ Department
    @Column(name = "department")
    private String department;

    // ✅ Employment Type
    @Column(name = "employment_type")
    private String employmentType;

    // ✅ Category
    @Column(name = "category")
    private String category;

    // ✅ Interview Rounds
    @Column(name = "interview_rounds")
    private Integer interviewRounds;

    // ✅ Interview Stages (optional)
    @Column(name = "interview_stages")
    private String interviewStages;

    // ✅ Status (OPEN / CLOSED)
    @Column(name = "status")
    private String status = "OPEN"; // 🔥 default value

    // ❌ OLD (WRONG)
    // private String createdDate;

    // ✅ FIXED (use timestamp)
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ Job Location
    @Column(name = "job_location")
    private String jobLocation;

    // ✅ Experience Level
    @Column(name = "experience_level")
    private String experienceLevel;

    // ✅ Vacancies
    @Column(name = "vacancies")
    private Integer vacancies;

    // ⚠️ IMPORTANT FIX
    // If you store multiple requirements → convert to JSON string
    @Column(name = "key_requirements", columnDefinition = "TEXT")
    private String keyRequirements;

    // ✅ Company ID
    @Column(name = "company_id")
    private UUID companyId;

    // 🔥 AUTO SET CREATED TIME
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = "OPEN";
        }
    }
}