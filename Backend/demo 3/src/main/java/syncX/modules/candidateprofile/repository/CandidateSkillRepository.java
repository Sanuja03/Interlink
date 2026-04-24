package syncX.modules.candidateprofile.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.candidateprofile.entity.CandidateSkill;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Long> {
    List<CandidateSkill> findByCandidateId(UUID candidateId);
    void deleteByCandidateIdAndId(UUID candidateId, Long skillId);
}
