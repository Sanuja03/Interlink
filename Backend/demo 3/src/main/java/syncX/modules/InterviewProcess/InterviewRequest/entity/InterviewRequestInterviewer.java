package syncX.modules.InterviewProcess.InterviewRequest.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@IdClass(InterviewRequestInterviewerId.class)
@Table(name = "interview_request_interviewers")
public class InterviewRequestInterviewer {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private InterviewRequest interviewRequest;

    @Id
    @Column(name = "interviewer_user_id", nullable = false)
    private UUID interviewerUserId;

    @Column(name = "was_available", nullable = false)
    private boolean wasAvailable;

    @Column(name = "response_status", nullable = false, length = 10)
    private String responseStatus = "pending";

    @Column(name = "responded_at")
    private OffsetDateTime respondedAt;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;
}