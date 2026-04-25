package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminInterviewer;

import java.util.UUID;

public interface AdminInterviewerRepository extends JpaRepository<AdminInterviewer, UUID> {
    // No custom methods needed — userId is the @Id, so use findById(userId) directly
}