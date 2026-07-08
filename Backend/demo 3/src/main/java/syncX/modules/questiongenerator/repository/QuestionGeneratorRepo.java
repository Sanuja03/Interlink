package syncX.modules.questiongenerator.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.questiongenerator.entity.QuestionGeneratorEntity;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionGeneratorRepo extends JpaRepository<QuestionGeneratorEntity, Long> {
    List<QuestionGeneratorEntity> findByCandidateIdOrderBySavedAtDesc(UUID candidateId);

    @Query("SELECT COUNT(q) > 0 FROM QuestionGeneratorEntity q WHERE q.candidateId = :candidateId AND q.jobId = :jobId")
    boolean existsByCandidateIdAndJobId(@Param("candidateId") UUID candidateId, @Param("jobId") Long jobId);
}
