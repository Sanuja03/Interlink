package syncX.modules.InterviewProcess.InterviewRequest.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.auth.entity.Interviewer;

import java.util.List;
import java.util.UUID;

/**
 * Extra queries we need on top of the existing InterviewerRepository.
 * If your existing InterviewerRepository already has these queries,
 * move them there instead of keeping a separate repo.
 */
@Repository
public interface AssignableInterviewerRepository
        extends JpaRepository<Interviewer, UUID> {

    /**
     * All interviewers belonging to a company whose auth account is NOT suspended.
     * (active + inactive are both assignable — only 'suspended' means banned.)
     *
     * Adjust the User entity path/field name if yours differ.
     */
    @Query("""
        SELECT i FROM Interviewer i, syncX.modules.auth.entity.User u
        WHERE i.userId = u.userId
          AND i.companyId = :companyId
          AND u.accountStatus <> 'suspended'
        ORDER BY i.fullName
    """)
    List<Interviewer> findAssignableByCompany(@Param("companyId") UUID companyId);
}