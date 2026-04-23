package syncX.modules.CompanyAdmin.profileview.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.CompanyAdmin.profileview.entity.Experience;

import java.util.List;
import java.util.UUID;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    List<Experience> findByCandidateId(UUID candidateId);
}