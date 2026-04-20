package syncX.modules.auth.repository;

import syncX.modules.auth.entity.Interviewer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface InterviewerRepository extends JpaRepository<Interviewer, UUID> {}
