package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminInterviewerAvailabilityDay;

import java.util.List;
import java.util.UUID;

public interface AdminInterviewerAvailabilityDayRepository
        extends JpaRepository<AdminInterviewerAvailabilityDay, UUID> {

    List<AdminInterviewerAvailabilityDay> findByInterviewerId(UUID interviewerId);
}