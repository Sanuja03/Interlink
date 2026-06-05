package syncX.modules.InterviewProcess.InterviewScheduling.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "interview_scheduled")
public class InterviewScheduled {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "scheduled_id")
    private UUID scheduledId;

    // FK to interview_requests
    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(name = "interview_id", nullable = false, length = 10)
    private String interviewId;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "job_application_id", nullable = false)
    private Long jobApplicationId;

    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "panel_size", nullable = false)
    private short panelSize;

    @Column(name = "interview_date", nullable = false)
    private LocalDate interviewDate;

    @Column(name = "interview_time", nullable = false)
    private LocalTime interviewTime;

    @Column(nullable = false, length = 10)
    private String mode;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    // NULL for Physical interviews
    @Column(name = "meeting_link", columnDefinition = "TEXT")
    private String meetingLink;

    // Set later when admin clicks "Send Scheduled Interview Details"
    @Column(name = "scorecard_id")
    private UUID scorecardId;

    @Column(nullable = false, length = 20)
    private String status = "scheduled";

    @Column(name = "finalized_by", nullable = false)
    private UUID finalizedBy;

    @Column(name = "finalized_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime finalizedAt;

    @Column(name = "updated_at", nullable = false, insertable = false)
    private OffsetDateTime updatedAt;
}