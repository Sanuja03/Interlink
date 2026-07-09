package syncX.modules.calendar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.candidatedashboard.dto.UpcomingInterviewDto;
import syncX.modules.calendar.entity.InterviewScheduled;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository("calendarInterviewScheduledRepository")
public interface InterviewScheduledRepository extends JpaRepository<InterviewScheduled, UUID> {

    List<InterviewScheduled> findByCandidateId(UUID candidateId);

    @Query("SELECT i FROM CalendarInterviewScheduled i LEFT JOIN FETCH i.job WHERE i.candidateId = :candidateId AND i.interviewDate >= :startDate AND i.interviewDate <= :endDate AND (i.status IS NULL OR i.status != 'cancelled') ORDER BY i.interviewDate ASC, i.interviewTime ASC")
    List<InterviewScheduled> findCandidateEvents(@Param("candidateId") UUID candidateId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT i FROM CalendarInterviewScheduled i LEFT JOIN FETCH i.job WHERE i.companyId = :companyId AND i.interviewDate >= :startDate AND i.interviewDate <= :endDate AND (i.status IS NULL OR i.status != 'cancelled') ORDER BY i.interviewDate ASC, i.interviewTime ASC")
    List<InterviewScheduled> findInterviewerEvents(@Param("companyId") UUID companyId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT i FROM CalendarInterviewScheduled i LEFT JOIN FETCH i.job WHERE i.candidateId = :candidateId AND i.interviewDate = :date AND (i.status IS NULL OR i.status != 'cancelled') ORDER BY i.interviewTime ASC")
    List<InterviewScheduled> findCandidateEventsByDate(@Param("candidateId") UUID candidateId, @Param("date") LocalDate date);

    @Query("SELECT i FROM CalendarInterviewScheduled i LEFT JOIN FETCH i.job WHERE i.companyId = :companyId AND i.interviewDate = :date AND (i.status IS NULL OR i.status != 'cancelled') ORDER BY i.interviewTime ASC")
    List<InterviewScheduled> findInterviewerEventsByDate(@Param("companyId") UUID companyId, @Param("date") LocalDate date);

    long countByCandidateId(UUID candidateId);

    @Query("""
            SELECT new syncX.modules.candidatedashboard.dto.UpcomingInterviewDto(
                i.scheduledId,
                i.interviewId,
                j.title,
                COALESCE(c.companyName, j.company),
                i.interviewDate,
                i.interviewTime,
                i.mode,
                COALESCE(i.status, 'SCHEDULED'),
                i.meetingLink
            )
            FROM CalendarInterviewScheduled i
            LEFT JOIN i.job j
            LEFT JOIN i.companyDetails c
            WHERE i.candidateId = :candidateId
              AND i.interviewDate >= :currentDate
              AND (i.status IS NULL OR LOWER(i.status) <> 'cancelled')
            ORDER BY i.interviewDate ASC, i.interviewTime ASC
            """)
    List<UpcomingInterviewDto> findUpcomingInterviewsByCandidateId(
            @Param("candidateId") UUID candidateId,
            @Param("currentDate") LocalDate currentDate);

}
