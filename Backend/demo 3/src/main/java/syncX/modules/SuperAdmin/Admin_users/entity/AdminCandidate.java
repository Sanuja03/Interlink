package syncX.modules.SuperAdmin.Admin_users.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminCandidate {

    @Id
    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "location")
    private String location;

    @Column(name = "work_mode")
    private String workMode;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}