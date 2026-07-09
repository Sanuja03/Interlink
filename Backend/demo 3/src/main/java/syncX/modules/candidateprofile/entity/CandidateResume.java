package syncX.modules.candidateprofile.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name = "CandidateSideResume")
@Data
@Table(name = "resumes")
public class CandidateResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
}
