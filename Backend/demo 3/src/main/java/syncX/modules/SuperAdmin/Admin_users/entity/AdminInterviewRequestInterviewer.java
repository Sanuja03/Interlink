package syncX.modules.SuperAdmin.Admin_users.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_request_interviewers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminInterviewRequestInterviewer {

    @Id
    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "interviewer_user_id")
    private UUID interviewerUserId;

    @Column(name = "was_available")
    private Boolean wasAvailable;

    @Column(name = "response_status")
    private String responseStatus;   // pending / accepted / rejected

    @Column(name = "responded_at")
    private OffsetDateTime respondedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}