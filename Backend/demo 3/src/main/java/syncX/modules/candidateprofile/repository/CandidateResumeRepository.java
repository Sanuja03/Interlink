package syncX.modules.candidateprofile.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.candidateprofile.entity.CandidateResume;

import java.util.List;
import java.util.UUID;

@Repository("candidateSideResumeRepository")
public interface CandidateResumeRepository extends JpaRepository<CandidateResume, Long> {
    List<CandidateResume> findByCandidateIdOrderByUploadedAtDesc(UUID candidateId);
}
