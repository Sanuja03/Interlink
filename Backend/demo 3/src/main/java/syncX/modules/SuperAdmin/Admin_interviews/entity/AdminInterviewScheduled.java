package syncX.modules.SuperAdmin.Admin_interviews.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "interview_scheduled")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminInterviewScheduled {

    @Id
    @Column(name = "scheduled_id")
    private UUID scheduledId;

    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "interview_id")
    private String interviewId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "panel_size")
    private Integer panelSize;

    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Column(name = "interview_time")
    private LocalTime interviewTime;

    @Column(name = "mode")
    private String mode;

    @Column(name = "admin_notes")
    private String adminNotes;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "status")
    private String status;
}