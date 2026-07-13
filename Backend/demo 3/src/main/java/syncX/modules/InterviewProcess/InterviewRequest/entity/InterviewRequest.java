package syncX.modules.InterviewProcess.InterviewRequest.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "interview_requests")
public class InterviewRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "interview_id", nullable = false, unique = true,
            insertable = false, updatable = false, length = 10)
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

    /** Duration of the interview in minutes. Used for conflict detection. */
    @Column(name = "duration_minutes", nullable = false)
    private short durationMinutes = 60;

    @Column(nullable = false, length = 10)
    private String mode;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    /** Physical interview venue. Null for Online interviews. */
    @Column(name = "interview_location", columnDefinition = "TEXT")
    private String interviewLocation;

    /**
     * DB check constraint: pending | finalized | cancelled.
     * Nothing else will persist — see interview_requests_status_check.
     */
    @Column(nullable = false, length = 10)
    private String status = "pending";

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    /**
     * Maintained by the database (trigger / default). updatable = false keeps
     * Hibernate from writing a stale loaded value back into the UPDATE
     * statement — without it, updated_at was appearing in every generated SQL.
     */
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "id", insertable = false, updatable = false)
    private long id;

    @Column(name = "interviewer_id", insertable = false, updatable = false)
    private UUID interviewerId;

    @OneToMany(mappedBy = "interviewRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<InterviewRequestInterviewer> interviewers = new ArrayList<>();
}