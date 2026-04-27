package syncX.modules.Scorecard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.Scorecard.entity.ScorecardTemplate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScorecardTemplateRepository
        extends JpaRepository<ScorecardTemplate, UUID> {

    List<ScorecardTemplate> findByCompanyIdAndJobIdOrderByCreatedAtDesc(
            UUID companyId, Long jobId);
}