package syncX.modules.InterviewProcess.InterviewScheduling.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.InterviewProcess.InterviewScheduling.entity.InterviewScheduled;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewScheduledRepository
        extends JpaRepository<InterviewScheduled, UUID> {

    // ── existing ────────────────────────────────────────────────
    boolean existsByRequestId(UUID requestId);

    Optional<InterviewScheduled> findByRequestId(UUID requestId);

    // ════════════════════════════════════════════════════════════
    // INTERVIEWER-SCOPED queries
    //
    // The link from interviewer → scheduled record is via
    // interview_request_interviewers (response_status = 'accepted').
    // We join on s.requestId = iri.interviewRequest.requestId.
    // ════════════════════════════════════════════════════════════

    /** Count of scheduled rows for this interviewer with a given status. */
    @Query("""
        SELECT COUNT(DISTINCT s)
        FROM InterviewScheduled s
        JOIN InterviewRequestInterviewer iri
             ON iri.interviewRequest.requestId = s.requestId
        WHERE iri.interviewerUserId = :interviewerUserId
          AND LOWER(iri.responseStatus) = 'accepted'
          AND LOWER(s.status) = LOWER(:status)
    """)
    long countByInterviewerAndStatus(@Param("interviewerUserId") UUID interviewerUserId,
                                     @Param("status") String status);

    /** Today's scheduled interviews for this interviewer (status = scheduled). */
    @Query("""
        SELECT DISTINCT s
        FROM InterviewScheduled s
        JOIN InterviewRequestInterviewer iri
             ON iri.interviewRequest.requestId = s.requestId
        WHERE iri.interviewerUserId = :interviewerUserId
          AND LOWER(iri.responseStatus) = 'accepted'
          AND LOWER(s.status) = 'scheduled'
          AND s.interviewDate = :today
        ORDER BY s.interviewTime ASC
    """)
    List<InterviewScheduled> findTodayForInterviewer(
            @Param("interviewerUserId") UUID interviewerUserId,
            @Param("today") LocalDate today);

    /**
     * Next upcoming interview for this interviewer (any future date or
     * later today), regardless of how far out it is.
     */
    @Query("""
        SELECT s
        FROM InterviewScheduled s
        JOIN InterviewRequestInterviewer iri
             ON iri.interviewRequest.requestId = s.requestId
        WHERE iri.interviewerUserId = :interviewerUserId
          AND LOWER(iri.responseStatus) = 'accepted'
          AND LOWER(s.status) = 'scheduled'
          AND (s.interviewDate > :today
               OR (s.interviewDate = :today AND s.interviewTime >= :nowTime))
        ORDER BY s.interviewDate ASC, s.interviewTime ASC
    """)
    List<InterviewScheduled> findUpcomingForInterviewer(
            @Param("interviewerUserId") UUID interviewerUserId,
            @Param("today") LocalDate today,
            @Param("nowTime") java.time.LocalTime nowTime);
}