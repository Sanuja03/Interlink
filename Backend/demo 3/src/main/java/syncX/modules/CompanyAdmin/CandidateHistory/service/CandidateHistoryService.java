package syncX.modules.CompanyAdmin.CandidateHistory.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.CandidateHistory.dto.CandidateHistoryResponseDTO;
import syncX.modules.CompanyAdmin.CandidateHistory.dto.HistoryStageDTO;
import syncX.modules.CompanyAdmin.CandidateHistory.entity.CandidateHistoryStage;
import syncX.modules.CompanyAdmin.CandidateHistory.repository.CandidateHistoryStageRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;
import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.sql.Timestamp;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class CandidateHistoryService {

    private final CandidateHistoryStageRepository historyRepository;
    private final ApplicationRepository applicationRepository;
    private final JdbcTemplate jdbc;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public CandidateHistoryService(CandidateHistoryStageRepository historyRepository,
                                   ApplicationRepository applicationRepository,
                                   JdbcTemplate jdbc) {
        this.historyRepository = historyRepository;
        this.applicationRepository = applicationRepository;
        this.jdbc = jdbc;
    }


    public CandidateHistoryResponseDTO getHistoryByApplication(Long jobApplicationId) {

        // 1. Load the application (raw SQL in repo — avoids Company_Id JPA issue)
        Application app = applicationRepository.findById(jobApplicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String currentStatus = app.getStatus() != null
                ? app.getStatus().toUpperCase() : "PENDING";

        // 2. Applied date
        LocalDateTime appliedDate = getAppliedDate(jobApplicationId);

        // 3. Shortlisted date (from candidate_history_stages)
        List<CandidateHistoryStage> recordedStages =
                historyRepository.findByJobApplicationIdOrderByStageDateAsc(jobApplicationId);

        Map<String, CandidateHistoryStage> stageMap = recordedStages.stream()
                .collect(Collectors.toMap(
                        s -> s.getStage().toUpperCase(),
                        s -> s,
                        (a, b) -> b
                ));

        // 4. Actual interview rounds from interview_requests
        List<InterviewRoundInfo> rounds = fetchInterviewRounds(jobApplicationId);

        // 5. Total rounds configured on the job (jobs.interview_rounds)
        int totalRoundsConfigured = fetchTotalRounds(jobApplicationId, rounds.size());

        // 6. Build the dynamic stage list
        List<HistoryStageDTO> stages = buildStages(
                currentStatus, appliedDate, stageMap, rounds, totalRoundsConfigured);

        // 7. Build and return response
        CandidateHistoryResponseDTO response = new CandidateHistoryResponseDTO();
        response.setCandidateId(app.getCandidateId());
        response.setCandidateName(app.getCandidateName());
        response.setJobTitle(app.getJobTitle());
        response.setJobApplicationId(jobApplicationId);
        response.setAiScore(app.getScore());
        response.setCurrentStatus(currentStatus);
        response.setStages(stages);
        return response;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Stage builder
    // ─────────────────────────────────────────────────────────────────────

    private List<HistoryStageDTO> buildStages(
            String currentStatus,
            LocalDateTime appliedDate,
            Map<String, CandidateHistoryStage> stageMap,
            List<InterviewRoundInfo> rounds,
            int totalRounds) {

        List<HistoryStageDTO> stages = new ArrayList<>();
        boolean isRejected = "REJECTED".equals(currentStatus);

        // ── Stage 1: Applied ────────────────────────────────────────────
        stages.add(completedStage("Applied",
                appliedDate != null ? appliedDate.format(DATE_FORMAT) : "—"));

        // ── Stage 2: Shortlisted ────────────────────────────────────────
        boolean wasShortlisted = !isRejected
                || stageMap.containsKey("SHORTLISTED")
                || !rounds.isEmpty();

        if (wasShortlisted) {
            String shortlistDate = stageMap.containsKey("SHORTLISTED")
                    && stageMap.get("SHORTLISTED").getStageDate() != null
                    ? stageMap.get("SHORTLISTED").getStageDate().format(DATE_FORMAT) : "—";
            stages.add(completedStage("Shortlisted", shortlistDate));
        } else {
            stages.add(notCompletedStage("Shortlisted"));
        }

        // ── Stages 3+: One pair per round ───────────────────────────────
        int displayRounds = Math.max(rounds.size(), totalRounds);
        boolean multiRound = displayRounds > 1;

        for (int i = 0; i < displayRounds; i++) {
            int roundNum = i + 1;
            boolean hasRequest = i < rounds.size();
            InterviewRoundInfo r = hasRequest ? rounds.get(i) : null;

            String scheduledLabel = multiRound
                    ? "Interview Round " + roundNum + " Scheduled"
                    : "Interview Scheduled";
            String interviewLabel = multiRound
                    ? "Interview Round " + roundNum
                    : "Interview";

            if (hasRequest) {
                stages.add(completedStage(scheduledLabel,
                        r.requestCreatedAt != null
                                ? r.requestCreatedAt.format(DATE_FORMAT) : "—"));

                if (r.interviewCompleted) {
                    stages.add(completedStage(interviewLabel,
                            r.interviewCompletedAt != null
                                    ? r.interviewCompletedAt.format(DATE_FORMAT) : "—"));
                } else {
                    stages.add(notCompletedStage(interviewLabel));
                }
            } else {
                stages.add(notCompletedStage(scheduledLabel));
                stages.add(notCompletedStage(interviewLabel));
            }
        }

        // Fallback placeholder if no rounds at all
        if (displayRounds == 0) {
            stages.add(notCompletedStage("Interview Scheduled"));
            stages.add(notCompletedStage("Interview"));
        }

        // ── Final stage: Feedback Received ─────────────────────────────
        boolean allRoundsDone = displayRounds > 0
                && rounds.size() == displayRounds
                && rounds.stream().allMatch(r -> r.interviewCompleted);

        if (allRoundsDone) {
            LocalDateTime lastAt = rounds.get(rounds.size() - 1).interviewCompletedAt;
            stages.add(completedStage("Feedback Received",
                    lastAt != null ? lastAt.format(DATE_FORMAT) : "—"));
        } else {
            stages.add(notCompletedStage("Feedback Received"));
        }

        return stages;
    }

    // ─────────────────────────────────────────────────────────────────────
    // DB helpers
    // ─────────────────────────────────────────────────────────────────────


    private List<InterviewRoundInfo> fetchInterviewRounds(Long jobApplicationId) {
        String sql =
                "SELECT ir.request_id, " +
                        "       ir.created_at                  AS req_created_at, " +
                        "       isc.status                     AS sched_status, " +
                        "       isc.finalized_at               AS sched_finalized_at, " +
                        "       COALESCE((" +
                        "         SELECT COUNT(*) FROM interviewer_score_submissions iss " +
                        "         WHERE iss.scheduled_id = isc.scheduled_id " +
                        "           AND iss.is_submitted = true" +
                        "       ), 0)                          AS score_count, " +
                        "       COALESCE((" +
                        // Check if the company admin has given a Pass/Fail decision for this
                        // application — manual_decision is set from the Interview Summary page.
                        // This covers cases where the admin decides without interviewer scores.
                        "         SELECT COUNT(*) FROM shortlisted_candidates sc " +
                        "         WHERE sc.job_application_id = ir.job_application_id " +
                        "           AND sc.manual_decision IS NOT NULL " +
                        "           AND sc.manual_decision != ''" +
                        "       ), 0)                          AS decision_count " +
                        "FROM   interview_requests ir " +
                        "LEFT JOIN interview_scheduled isc ON isc.request_id = ir.request_id " +
                        "WHERE  ir.job_application_id = ? " +
                        "  AND  ir.status != 'cancelled' " +
                        "ORDER BY ir.created_at ASC";

        try {
            return jdbc.query(sql, (rs, rowNum) -> {
                InterviewRoundInfo info = new InterviewRoundInfo();

                Timestamp reqTs = rs.getTimestamp("req_created_at");
                info.requestCreatedAt = reqTs != null ? reqTs.toLocalDateTime() : null;

                String schedStatus  = rs.getString("sched_status");
                int    scoreCount   = rs.getInt("score_count");
                int    decisionCount = rs.getInt("decision_count");

                // Round is done if: scheduled status completed, OR scores exist,
                // OR the admin already gave a manual pass/fail decision.
                info.interviewCompleted =
                        "completed".equalsIgnoreCase(schedStatus)
                                || scoreCount > 0
                                || decisionCount > 0;

                if (info.interviewCompleted) {
                    Timestamp finalTs = rs.getTimestamp("sched_finalized_at");
                    info.interviewCompletedAt = finalTs != null
                            ? finalTs.toLocalDateTime() : null;
                }

                return info;
            }, jobApplicationId);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }


    private int fetchTotalRounds(Long jobApplicationId, int fallback) {
        try {
            Integer rounds = jdbc.queryForObject(
                    "SELECT j.interview_rounds " +
                            "FROM jobs j " +
                            "JOIN job_applications ja ON ja.job_id = j.id " +
                            "WHERE ja.id = ?",
                    Integer.class, jobApplicationId);
            return (rounds != null && rounds > 0) ? rounds : Math.max(fallback, 1);
        } catch (Exception e) {
            return Math.max(fallback, 1);
        }
    }


    private LocalDateTime getAppliedDate(Long jobApplicationId) {
        try {
            List<Map<String, Object>> rows = jdbc.queryForList(
                    "SELECT applied_date FROM job_applications WHERE id = ?",
                    jobApplicationId);
            if (rows.isEmpty()) return null;
            Object val = rows.get(0).get("applied_date");
            if (val instanceof java.sql.Date)
                return ((java.sql.Date) val).toLocalDate().atStartOfDay();
            if (val instanceof Timestamp)
                return ((Timestamp) val).toLocalDateTime();
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Stage DTO factories
    // ─────────────────────────────────────────────────────────────────────

    private HistoryStageDTO completedStage(String label, String date) {
        HistoryStageDTO dto = new HistoryStageDTO();
        dto.setStage(label);
        dto.setStatus("Completed");
        dto.setDate(date);
        return dto;
    }

    private HistoryStageDTO notCompletedStage(String label) {
        HistoryStageDTO dto = new HistoryStageDTO();
        dto.setStage(label);
        dto.setStatus("Not Completed");
        dto.setDate(null);
        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Inner value holder
    // ─────────────────────────────────────────────────────────────────────

    private static class InterviewRoundInfo {
        LocalDateTime requestCreatedAt;
        boolean       interviewCompleted;
        LocalDateTime interviewCompletedAt;
    }
}