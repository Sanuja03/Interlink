package syncX.modules.candidateprofile.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity(name = "CandidateSideProfile")
@Data
@Table(name = "candidates")
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "candidate_id")
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "location")
    private String location;

    @Column(name = "date_of_birth")
    private java.time.LocalDate dateOfBirth;

    @Column(name = "headline", columnDefinition = "TEXT")
    private String headline;
}
