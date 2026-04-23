package syncX.modules.CompanyAdmin.profileview.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.CompanyAdmin.profileview.entity.Candidate;

import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
}