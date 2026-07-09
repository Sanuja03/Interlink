package syncX.modules.CompanyAdmin.CandidateProfile.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "candidate_skills")
public class CandidateSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "skills")
    private String skills;

    public Long getId() { return id; }
    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
}