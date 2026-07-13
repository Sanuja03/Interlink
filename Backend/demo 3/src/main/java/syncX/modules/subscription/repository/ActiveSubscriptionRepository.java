package syncX.modules.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import syncX.modules.subscription.entity.ActiveSubscription;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActiveSubscriptionRepository extends JpaRepository<ActiveSubscription, Long> {

    Optional<ActiveSubscription> findByCompanyId(UUID companyId);

    @Query(value = "SELECT company_id, company_name, created_at FROM companies", nativeQuery = true)
    List<Object[]> findAllCompanyNamesRaw();

    /**
     * Count interviewers for a given company directly via native query.
     * Avoids needing a separate InterviewerRepository.
     */
    @Query(value = "SELECT COUNT(*) FROM interviewers WHERE company_id = :companyId", nativeQuery = true)
    long countInterviewersByCompanyId(@Param("companyId") UUID companyId);
}