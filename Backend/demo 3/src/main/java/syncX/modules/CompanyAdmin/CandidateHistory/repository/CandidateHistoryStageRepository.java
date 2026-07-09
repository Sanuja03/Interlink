package syncX.modules.CompanyAdmin.CandidateHistory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.CandidateHistory.entity.CandidateHistoryStage;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateHistoryStageRepository extends JpaRepository<CandidateHistoryStage, Long> {

    // Get all stages for a specific application
    List<CandidateHistoryStage> findByJobApplicationIdOrderByStageDateAsc(Long jobApplicationId);

    // Get all stages for a candidate in a company
    List<CandidateHistoryStage> findByCandidateIdAndCompanyIdOrderByStageDateAsc(UUID candidateId, UUID companyId);
}