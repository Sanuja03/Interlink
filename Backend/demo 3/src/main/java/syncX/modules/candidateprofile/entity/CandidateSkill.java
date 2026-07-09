package syncX.modules.candidateprofile.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity(name = "CandidateSideSkill")
@Data
@Table(name = "candidate_skills")
public class CandidateSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "skills")
    private String skillName;

}
