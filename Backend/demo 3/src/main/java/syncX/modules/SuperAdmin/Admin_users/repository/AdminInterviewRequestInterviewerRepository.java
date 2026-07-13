package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminInterviewRequestInterviewer;

import java.util.UUID;

public interface AdminInterviewRequestInterviewerRepository
        extends JpaRepository<AdminInterviewRequestInterviewer, UUID> {

    // Total requests assigned to this interviewer
    long countByInterviewerUserId(UUID interviewerUserId);

    // Count by specific response status (pending / accepted / rejected)
    long countByInterviewerUserIdAndResponseStatus(UUID interviewerUserId, String responseStatus);
}