package syncX.modules.SuperAdmin.Admin_activities.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import syncX.modules.SuperAdmin.Admin_activities.entity.ActivityLog;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // Fetch all activity logs for a specific user
    List<ActivityLog> findByUserId(UUID userId);

    // Custom query to filter logs by role, search text, and date range with pagination
    @Query(
            value = """
        SELECT * FROM activity_logs
        WHERE (
            :userRole IS NULL OR :userRole = ''
            OR LOWER(user_role) = LOWER(:userRole)
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(COALESCE(description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(action, ''))      LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(entity_type, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(user_role, ''))   LIKE LOWER(CONCAT('%', :search, '%'))
            )
        )
        AND (
            CAST(:fromDate AS timestamp) IS NULL
            OR created_at >= CAST(:fromDate AS timestamp)
        )
        AND (
            CAST(:toDate AS timestamp) IS NULL
            OR created_at <= CAST(:toDate AS timestamp)
        )
        ORDER BY created_at DESC
    """,
            countQuery = """
        SELECT COUNT(*) FROM activity_logs
        WHERE (
            :userRole IS NULL OR :userRole = ''
            OR LOWER(user_role) = LOWER(:userRole)
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(COALESCE(description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(action, ''))      LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(entity_type, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(user_role, ''))   LIKE LOWER(CONCAT('%', :search, '%'))
            )
        )
        AND (
            CAST(:fromDate AS timestamp) IS NULL
            OR created_at >= CAST(:fromDate AS timestamp)
        )
        AND (
            CAST(:toDate AS timestamp) IS NULL
            OR created_at <= CAST(:toDate AS timestamp)
        )
    """,
            nativeQuery = true
    )
    @Transactional(readOnly = true)
    Page<ActivityLog> searchLogs(
            @Param("userRole")  String userRole,
            @Param("search")    String search,
            @Param("fromDate")  LocalDateTime fromDate,
            @Param("toDate")    LocalDateTime toDate,
            Pageable pageable
    );
}