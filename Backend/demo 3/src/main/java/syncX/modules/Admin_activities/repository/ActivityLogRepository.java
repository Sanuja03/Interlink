package syncX.modules.Admin_activities.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import syncX.modules.Admin_activities.entity.ActivityLog;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByUserRoleContainingIgnoreCase(
            String userRole,
            Pageable pageable
    );
}
