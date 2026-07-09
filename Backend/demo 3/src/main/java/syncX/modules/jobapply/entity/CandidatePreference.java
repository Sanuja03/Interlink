package syncX.modules.jobapply.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@Table(name = "candidate_preferences")
public class CandidatePreference {
    @Id
    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "expected_salary")
    private Double expectedSalary;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "current_role")
    private String currentRole;

    @Column(name = "current_company")
    private String currentCompany;

    @Column(name = "available_start_date")
    private LocalDate availableStartDate;

    @Column(name = "source")
    private String source;
}
