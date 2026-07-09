package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminUsersInterviewRequest;

import java.util.UUID;

public interface AdminCandidateInterviewRequestRepository
        extends JpaRepository<AdminUsersInterviewRequest, Long> {

    // Count all requests for a candidate (used in candidate stats)
    long countByCandidateId(UUID candidateId);

    // Count all requests assigned to an interviewer (total interviews)
    long countByInterviewerId(UUID userId);

    // Count pending requests for an interviewer
    long countByInterviewerIdAndStatus(UUID userId, String status);
}