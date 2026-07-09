package syncX.modules.candidateprofile.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity(name = "CandidateSideEducation")
@Table(name = "c_education")
public class CandidateEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "degree")
    private String degree;

    @Column(name = "institution")
    private String institution;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}
