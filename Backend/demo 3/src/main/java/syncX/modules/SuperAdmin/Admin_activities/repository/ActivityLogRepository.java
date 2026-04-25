package syncX.modules.SuperAdmin.Admin_activities.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import syncX.modules.SuperAdmin.Admin_activities.entity.ActivityLog;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {


    List<ActivityLog> findByUserId(UUID userId);

        @Query("""
        SELECT a FROM ActivityLog a
        WHERE (:userRole IS NULL OR :userRole = '' 
               OR LOWER(a.userRole) LIKE LOWER(CONCAT('%', :userRole, '%')))
        
        AND (:search IS NULL OR :search = '' OR (
            LOWER(COALESCE(a.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(a.action, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(a.entityType, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(a.userRole, '')) LIKE LOWER(CONCAT('%', :search, '%'))
        ))
        
        AND (:fromDate IS NULL OR a.createdAt >= :fromDate)
        AND (:toDate IS NULL OR a.createdAt <= :toDate)
        
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