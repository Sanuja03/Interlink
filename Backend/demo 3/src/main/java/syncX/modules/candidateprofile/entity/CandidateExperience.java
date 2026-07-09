package syncX.modules.candidateprofile.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity(name = "CandidateSideExperience")
@Table(name = "experience")
public class CandidateExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "ccompany_name")
    private String ccompanyName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}
