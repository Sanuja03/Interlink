package syncX.modules.CompanyAdmin.ApplicationManagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "application_management")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationManagement {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "job_id")
    private UUID jobId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "ai_score")
    private Integer aiScore;

    @Column(name = "status")
    private String status;

    @Column(name = "applied_date")
    private LocalDateTime appliedDate;

    @Column(name = "interview_date")
    private LocalDateTime interviewDate;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.appliedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}