package syncX.modules.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.auth.entity.Candidate;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {}
