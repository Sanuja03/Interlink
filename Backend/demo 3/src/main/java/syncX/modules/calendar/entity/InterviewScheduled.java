package syncX.modules.calendar.entity;

import jakarta.persistence.*;
import lombok.Data;
import syncX.modules.jobpostdetails.entity.CompanyDetails;
import syncX.modules.jobpostdetails.entity.JobDetails;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_scheduled")
@Data
public class InterviewScheduled {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "scheduled_id")
    private UUID scheduledId;

    @Column(name = "request_id", unique = true)
    private UUID requestId;

    @Column(name = "interview_id")
    private String interviewId;

    @Column(name = "company_id")
    private UUID companyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", referencedColumnName = "company_id", insertable = false, updatable = false)
    private CompanyDetails companyDetails;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "job_application_id")
    private Long jobApplicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private JobDetails job;

    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "panel_size")
    private Integer panelSize;

    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Column(name = "interview_time")
    private LocalTime interviewTime;

    @Column(name = "mode")
    private String mode; // Online / Onsite

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "meeting_link", columnDefinition = "TEXT")
    private String meetingLink;

    @Column(name = "scorecard_id")
    private UUID scorecardId;

    @Column(name = "status")
    private String status;

    @Column(name = "finalized_by")
    private UUID finalizedBy;

    @Column(name = "finalized_at")
    private OffsetDateTime finalizedAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
