package syncX.modules.CompanyAdmin.CandidateProfile.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.CandidateProfile.entity.Resume;
import java.util.List;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByCandidateId(UUID candidateId);
}