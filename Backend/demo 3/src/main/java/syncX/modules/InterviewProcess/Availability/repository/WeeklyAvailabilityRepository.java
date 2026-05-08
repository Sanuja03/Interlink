package syncX.modules.InterviewProcess.Availability.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.InterviewProcess.Availability.entity.WeeklyAvailability;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeeklyAvailabilityRepository extends JpaRepository<WeeklyAvailability, UUID> {

    // Interviewer: find my availability for a specific week
    Optional<WeeklyAvailability> findByUserIdAndWeekKey(UUID userId, String weekKey);

    // Company admin: find all submitted availability for a week within the company
    List<WeeklyAvailability> findByCompanyIdAndWeekKeyAndStatus(
            UUID companyId, String weekKey, String status);
}

