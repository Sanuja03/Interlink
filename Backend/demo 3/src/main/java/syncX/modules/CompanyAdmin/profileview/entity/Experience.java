package syncX.modules.CompanyAdmin.profileview.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "experience")
public class Experience {

    @Id
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "ccompany_name")
    private String companyName;

    @Column(name = "start_date")
    private Date startDate;

    @Column(name = "end_date")
    private Date endDate;
}