package syncX.modules.candidatedashboard.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidateId;
    private String jobTitle;
    private String company;
    private String appliedDate;
    private String shortlistedDate;
    private String interviewDate;
    private String result; // e.g. "Pending" or "Rejected"
}
