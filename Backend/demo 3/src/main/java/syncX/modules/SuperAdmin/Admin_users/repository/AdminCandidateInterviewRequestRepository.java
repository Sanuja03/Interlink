package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminUsersInterviewRequest;

import java.util.UUID;

public interface AdminCandidateInterviewRequestRepository
        extends JpaRepository<AdminUsersInterviewRequest, UUID> {

    // Count all requests for a candidate (used in candidate stats)
    long countByCandidateId(UUID candidateId);

}