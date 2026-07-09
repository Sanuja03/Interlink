package syncX.modules.SuperAdmin.Admin_users.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "interview_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUsersInterviewRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "interviewer_id")
    private UUID interviewerId;

    @Column(name = "status")
    private String status;
}