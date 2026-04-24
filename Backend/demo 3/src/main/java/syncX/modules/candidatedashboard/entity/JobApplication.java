package syncX.modules.candidatedashboard.entity;
import syncX.modules.enums.ApplicationStatus;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;




    @Column(name = "candidate_id")
    private UUID candidateId;
    private String jobTitle;
    private String company;
    private LocalDate appliedDate;
    private LocalDate shortlistedDate;
    private LocalDate interviewDate;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus result; // e.g. "Pending" or "Rejected"
}
