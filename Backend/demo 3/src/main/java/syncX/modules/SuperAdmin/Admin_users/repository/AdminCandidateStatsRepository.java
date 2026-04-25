package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminUsersJobApplication;

import java.util.UUID;

public interface AdminCandidateStatsRepository extends JpaRepository<AdminUsersJobApplication, Long> {

    long countByCandidateId(UUID candidateId);

    long countByCandidateIdAndStatus(UUID candidateId, String status);
}