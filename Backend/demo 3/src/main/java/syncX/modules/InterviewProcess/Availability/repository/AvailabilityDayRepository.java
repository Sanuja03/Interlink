package syncX.modules.InterviewProcess.Availability.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.InterviewProcess.Availability.entity.AvailabilityDay;
import syncX.modules.InterviewProcess.Availability.entity.AvailabilityDayId;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AvailabilityDayRepository extends JpaRepository<AvailabilityDay, AvailabilityDayId> {

    @Query("""
        SELECT ad FROM AvailabilityDay ad
        JOIN FETCH ad.weeklyAvailability wa
        WHERE ad.id.availableDate = :date
          AND ad.isAvailable = true
          AND wa.status = 'submitted'
          AND wa.companyId = :companyId
    """)
    List<AvailabilityDay> findAvailableByDateAndCompany(
            @Param("date") LocalDate date,
            @Param("companyId") UUID companyId);

//    @Query("""
//        SELECT ad FROM AvailabilityDay ad
//        JOIN FETCH ad.weeklyAvailability wa
//        WHERE ad.id.availableDate = :date
//          AND ad.isAvailable = true
//          AND wa.status = 'submitted'
//          AND wa.companyId = :companyId
//          AND wa.weekStartDate = :weekStartDate
//    """)
//    List<AvailabilityDay> findAvailableByDateAndCompanyAndWeek(
//            @Param("date") LocalDate date,
//            @Param("companyId") UUID companyId,
//            @Param("weekStartDate") LocalDate weekStartDate);
}