package syncX.modules.auth.repository;

import syncX.modules.auth.entity.Interviewer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// ID type is now UUID (user_id) — was String (interviewer_id) before the fix.
@Repository
public interface InterviewerRepository extends JpaRepository<Interviewer, UUID> {

    List<Interviewer> findByCompanyId(UUID companyId);

    Optional<Interviewer> findByUserId(UUID userId);

    /**
     * Per-company uniqueness check for the employee (interviewer) ID.
     * Employee IDs are unique WITHIN a company — different companies may reuse
     * the same ID, so the check is scoped by company_id.
     */
    boolean existsByCompanyIdAndInterviewerId(UUID companyId, String interviewerId);

    /**
     * Look up an interviewer by emp ID within a specific company.
     * Used by admin actions (view / activate / deactivate) — since emp ID is no
     * longer globally unique, it must be resolved together with the company.
     */
    Optional<Interviewer> findByCompanyIdAndInterviewerId(UUID companyId, String interviewerId);
}