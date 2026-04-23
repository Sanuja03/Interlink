package syncX.modules.SuperAdmin.Admin_activities.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

import syncX.modules.SuperAdmin.Admin_activities.entity.ActivityLog;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

        @Query("""
        SELECT a FROM ActivityLog a
        WHERE (:userRole = '' OR LOWER(a.userRole) LIKE LOWER(CONCAT('%', :userRole, '%')))
        AND (:search = '' OR (
            LOWER(COALESCE(a.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(a.action, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(a.entityType, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(a.userRole, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            ))
        AND (CAST(:fromDate AS timestamp) IS NULL OR a.createdAt >= :fromDate)
        AND (CAST(:toDate AS timestamp) IS NULL OR a.createdAt <= :toDate)
        ORDER BY a.createdAt DESC
        """)
        Page<ActivityLog> searchLogs(
                @Param("userRole") String userRole,
                @Param("search") String search,
                @Param("fromDate") LocalDateTime fromDate,
                @Param("toDate") LocalDateTime toDate,
                Pageable pageable
        );
}
