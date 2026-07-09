package syncX.modules.cjobpost.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity(name = "CompanyJobRequirement")
@Getter
@Setter
@Table(name = "job_requirement")
public class JobRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String requirement;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "job_id")
    private Cjobpost job;

}