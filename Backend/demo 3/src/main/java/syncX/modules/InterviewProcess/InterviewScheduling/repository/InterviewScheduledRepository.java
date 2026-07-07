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


    boolean existsByRequestId(UUID requestId);

    Optional<InterviewScheduled> findByRequestId(UUID requestId);


    /**
     * Count interviews this specific interviewer still needs to evaluate.
     * Uses a native query because interviewer_score_submissions has no JPA entity.
     * Excludes any interview where this interviewer has already submitted their scores.
     * Used for the "Scheduled" dashboard stat card.
     */
    @Query(value = """
        SELECT COUNT(DISTINCT s.scheduled_id)
        FROM interview_scheduled s
        JOIN interview_request_interviewers iri
             ON iri.request_id = s.request_id
        WHERE iri.interviewer_user_id = :interviewerUserId
          AND LOWER(iri.response_status) = 'accepted'
          AND LOWER(s.status) = 'scheduled'
          AND NOT EXISTS (
              SELECT 1 FROM interviewer_score_submissions sub
              WHERE sub.scheduled_id = s.scheduled_id
                AND sub.interviewer_user_id = :interviewerUserId
                AND sub.is_submitted = true
          )
    """, nativeQuery = true)
    long countPersonallyScheduledByInterviewer(
            @Param("interviewerUserId") UUID interviewerUserId);

    /**
     * Count interviews this specific interviewer has personally submitted scores for.
     * Uses a native query because interviewer_score_submissions has no JPA entity.
     * Used for the "Completed" dashboard stat card — reflects the individual's own
     * submissions rather than interview_scheduled.status (which only flips when ALL
     * panelists have submitted).
     */
    @Query(value = """
        SELECT COUNT(DISTINCT sub.scheduled_id)
        FROM interviewer_score_submissions sub
        JOIN interview_scheduled s ON s.scheduled_id = sub.scheduled_id
        JOIN interview_request_interviewers iri
             ON iri.request_id = s.request_id
        WHERE iri.interviewer_user_id = :interviewerUserId
          AND LOWER(iri.response_status) = 'accepted'
          AND sub.interviewer_user_id = :interviewerUserId
          AND sub.is_submitted = true
    """, nativeQuery = true)
    long countPersonallyCompletedByInterviewer(
            @Param("interviewerUserId") UUID interviewerUserId);

    /**
     * Today's scheduled interviews for this interviewer,
     * excluding ones they have already personally submitted scores for.
     * Uses a native query because interviewer_score_submissions has no JPA entity.
     * Ensures the Today Schedule table clears immediately after this interviewer
     * submits, even if other panelists haven't submitted yet.
     */
    @Query(value = """
        SELECT DISTINCT s.*
        FROM interview_scheduled s
        JOIN interview_request_interviewers iri
             ON iri.request_id = s.request_id
        WHERE iri.interviewer_user_id = :interviewerUserId
          AND LOWER(iri.response_status) = 'accepted'
          AND LOWER(s.status) = 'scheduled'
          AND s.interview_date = :today
          AND NOT EXISTS (
              SELECT 1 FROM interviewer_score_submissions sub
              WHERE sub.scheduled_id = s.scheduled_id
                AND sub.interviewer_user_id = :interviewerUserId
                AND sub.is_submitted = true
          )
        ORDER BY s.interview_time ASC
    """, nativeQuery = true)
    List<InterviewScheduled> findTodayForInterviewer(
            @Param("interviewerUserId") UUID interviewerUserId,
            @Param("today") LocalDate today);

    /**
     * Next upcoming interview for this interviewer (any future date or later today),
     * excluding ones they have already personally submitted scores for.
     * Uses a native query because interviewer_score_submissions has no JPA entity.
     * Ensures the Next Interview card clears immediately after this interviewer submits.
     */
    @Query(value = """
        SELECT s.*
        FROM interview_scheduled s
        JOIN interview_request_interviewers iri
             ON iri.request_id = s.request_id
        WHERE iri.interviewer_user_id = :interviewerUserId
          AND LOWER(iri.response_status) = 'accepted'
          AND LOWER(s.status) = 'scheduled'
          AND (s.interview_date > :today
               OR (s.interview_date = :today AND s.interview_time >= :nowTime))
          AND NOT EXISTS (
              SELECT 1 FROM interviewer_score_submissions sub
              WHERE sub.scheduled_id = s.scheduled_id
                AND sub.interviewer_user_id = :interviewerUserId
                AND sub.is_submitted = true
          )
        ORDER BY s.interview_date ASC, s.interview_time ASC
    """, nativeQuery = true)
    List<InterviewScheduled> findUpcomingForInterviewer(
            @Param("interviewerUserId") UUID interviewerUserId,
            @Param("today") LocalDate today,
            @Param("nowTime") java.time.LocalTime nowTime);

    List<InterviewScheduled> findByStatusAndInterviewDateBefore(String scheduled, LocalDate today);

    /**
     * True if ANY interviewer has submitted their scores for this scheduled
     * interview. interviewer_score_submissions has no JPA entity, so this is a
     * native query (same table the dashboard counts use). Used by the lifecycle
     * job to decide completed (evaluated) vs expired (not evaluated).
     */
    @Query(value = """
        SELECT EXISTS (
            SELECT 1 FROM interviewer_score_submissions sub
            WHERE sub.scheduled_id = :scheduledId
              AND sub.is_submitted = true
        )
    """, nativeQuery = true)
    boolean hasSubmittedEvaluation(@Param("scheduledId") UUID scheduledId);
}