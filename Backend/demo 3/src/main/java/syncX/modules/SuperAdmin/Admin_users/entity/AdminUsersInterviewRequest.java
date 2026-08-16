package syncX.modules.SuperAdmin.Admin_users.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "interview_requests")
@Getter
@Setter
@NoArgsConstructor
public class AdminUsersInterviewRequest {

    @Id
    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "candidate_id")
    private UUID candidateId;
}
