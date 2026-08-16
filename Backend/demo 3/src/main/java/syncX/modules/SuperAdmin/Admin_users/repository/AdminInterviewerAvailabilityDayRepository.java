package syncX.modules.SuperAdmin.Admin_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import syncX.modules.SuperAdmin.Admin_users.entity.AdminInterviewerAvailabilityDay;

import java.util.List;
import java.util.UUID;

public interface AdminInterviewerAvailabilityDayRepository
        extends JpaRepository<AdminInterviewerAvailabilityDay, UUID> {

    List<AdminInterviewerAvailabilityDay> findByintavailabilityId(UUID intavailabilityId);

    @Query(value = """
        SELECT d.*
        FROM interviewer_availability_days d
        JOIN interviewer_weekly_availability w
          ON d.intavailability_id = w.intavailability_id
        WHERE w.user_id = :userId
        """, nativeQuery = true)
    List<AdminInterviewerAvailabilityDay> findByUserId(@Param("userId") UUID userId);
}