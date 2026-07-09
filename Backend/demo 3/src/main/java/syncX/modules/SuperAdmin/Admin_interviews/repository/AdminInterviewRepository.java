package syncX.modules.SuperAdmin.Admin_interviews.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import syncX.modules.SuperAdmin.Admin_interviews.entity.AdminInterviewScheduled;

import java.util.UUID;

public interface AdminInterviewRepository extends JpaRepository<AdminInterviewScheduled, UUID> {

    // Custom query to search interviews by keyword and status with pagination
    @Query(
            value = """
            SELECT * FROM interview_scheduled
            WHERE (
                :search IS NULL OR :search = '' OR
                LOWER(interview_id) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(mode) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(status) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            AND (
                :status IS NULL OR :status = '' 
                OR LOWER(status) = LOWER(:status)
            )
            ORDER BY interview_date DESC, interview_time DESC
        """,
            countQuery = "SELECT COUNT(*) FROM interview_scheduled", // Count query for pagination
            nativeQuery = true
    )
    Page<AdminInterviewScheduled> searchInterviews(
            @Param("search") String search, // Search keyword across multiple fields
            @Param("status") String status, // Filter by interview status
            Pageable pageable               // Pagination and sorting info
    );
}