package syncX.modules.SuperAdmin.Admin_users.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "interviewers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminInterviewer {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "interviewer_id")
    private String interviewerId;

    @Column(name = "email")
    private String email;

    @Column(name = "about")
    private String about;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "company_id")
    private UUID companyId;
}