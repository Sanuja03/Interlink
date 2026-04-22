package syncX.modules.candidatedashboard.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "candidate_interviews")
public class CandidateInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // FIXED (int → Long)

    @Column(name = "candidate_id")
    private Long candidateId;  // FIXED mapping

    private String company;
    private String role;

    private LocalDate date;  // OK for now (but not ideal)
    private LocalTime time;

    private String mode;
    private String status;
}