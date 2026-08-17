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

        // 1. Load the application
        Application app = applicationRepository.findById(jobApplicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String currentStatus = app.getStatus() != null
                ? app.getStatus().toUpperCase() : "PENDING";

        // 2. Applied date
        LocalDateTime appliedDate = getAppliedDate(jobApplicationId);

        // 3. All recorded history stages, keyed by upper-cased stage name.
        //    These ROUND_n rows are the SINGLE SOURCE OF TRUTH for whether a
        //    round has been reached / completed. They are written by the
        //    Shortlisting + InterviewSummary (PASS/FAIL) flows.
        List<CandidateHistoryStage> recordedStages =
                historyRepository.findByJobApplicationIdOrderByStageDateAsc(jobApplicationId);

        Map<String, CandidateHistoryStage> stageMap = recordedStages.stream()
                .collect(Collectors.toMap(
                        s -> s.getStage().toUpperCase(),
                        s -> s,
                        (a, b) -> b
                ));

        // 4. Total rounds configured on the job (jobs.interview_rounds)
        int totalRoundsConfigured = fetchTotalRounds(jobApplicationId, 1);

        // 5. How many rounds have actually had an interview REQUEST created.
        //    Robust against the "cancel previous request on reschedule"
        //    behaviour — it does NOT rely on counting non-cancelled rows.
        int scheduledUpToRound = fetchScheduledUpToRound(jobApplicationId);
        Map<Integer, LocalDateTime> scheduledDates = fetchScheduledDates(jobApplicationId);

        // 6. Build the dynamic stage list
        List<HistoryStageDTO> stages = buildStages(
                currentStatus, appliedDate, stageMap,
                totalRoundsConfigured, scheduledUpToRound, scheduledDates);

        // 7. Build and return response
        CandidateHistoryResponseDTO response = new CandidateHistoryResponseDTO();
        response.setCandidateId(app.getCandidateId());
        response.setCandidateName(app.getCandidateName());
        response.setJobId(app.getJobId());
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
            int totalRounds,
            int scheduledUpToRound,
            Map<Integer, LocalDateTime> scheduledDates) {

        List<HistoryStageDTO> stages = new ArrayList<>();

        boolean processComplete = stageMap.containsKey("HIRED");
        boolean isRejected = "REJECTED".equals(currentStatus) || stageMap.containsKey("REJECTED");

        // How many rounds the candidate has actually REACHED (has a ROUND_n row).
        int reachedRounds = 0;
        for (String key : stageMap.keySet()) {
            if (key.startsWith("ROUND_")) {
                try {
                    reachedRounds = Math.max(reachedRounds,
                            Integer.parseInt(key.substring("ROUND_".length())));
                } catch (NumberFormatException ignored) { /* skip */ }
            }
        }

        // ── Stage 1: Applied ───────────────────────────────────────────
        stages.add(completedStage("Applied",
                appliedDate != null ? appliedDate.format(DATE_FORMAT) : "—"));

        // ── Stage 2: Shortlisted ───────────────────────────────────────
        // Completed only once the candidate has genuinely been shortlisted
        // (a ROUND_1 stage exists) or has moved beyond shortlisting.
        // A brand-new PENDING applicant is NOT shortlisted.
        boolean shortlisted =
                reachedRounds >= 1
                        || scheduledUpToRound >= 1
                        || processComplete
                        || stageMap.containsKey("SHORTLISTED")
                        || "SHORTLISTED".equals(currentStatus)
                        || "INTERVIEW".equals(currentStatus);

        if (shortlisted) {
            stages.add(completedStage("Shortlisted", resolveShortlistDate(stageMap)));
        } else {
            stages.add(notCompletedStage("Shortlisted"));
        }

        // ── Stages 3+: One (Scheduled, Interview) pair per round ────────
        int displayRounds = Math.max(Math.max(totalRounds, reachedRounds), scheduledUpToRound);
        if (displayRounds < 1) displayRounds = 1;
        boolean multiRound = displayRounds > 1;

        for (int n = 1; n <= displayRounds; n++) {
            CandidateHistoryStage roundStage = stageMap.get("ROUND_" + n);
            boolean roundCompleted = roundStage != null
                    && "COMPLETED".equalsIgnoreCase(roundStage.getStatus());
            LocalDateTime roundCompletedAt = roundStage != null ? roundStage.getStageDate() : null;

            // A round counts as "Scheduled" if an interview request has been
            // sent for it (n <= scheduledUpToRound). A completed round was
            // obviously scheduled too, so treat that as scheduled as well.
            boolean scheduled = roundCompleted || n <= scheduledUpToRound;
            LocalDateTime scheduledAt = scheduledDates.get(n);

            String scheduledLabel = multiRound
                    ? "Interview Round " + n + " Scheduled" : "Interview Scheduled";
            String interviewLabel = multiRound
                    ? "Interview Round " + n : "Interview";

            if (scheduled) {
                stages.add(completedStage(scheduledLabel,
                        scheduledAt != null ? scheduledAt.format(DATE_FORMAT) : "—"));
            } else {
                stages.add(notCompletedStage(scheduledLabel));
            }

            if (roundCompleted) {
                stages.add(completedStage(interviewLabel,
                        roundCompletedAt != null ? roundCompletedAt.format(DATE_FORMAT) : "—"));
            } else {
                stages.add(notCompletedStage(interviewLabel));
            }
        }

        // ── Final stage: Feedback Received ─────────────────────────────
        // Complete only once the whole process is done: either an explicit
        // HIRED row exists, or the last configured round is COMPLETED.
        boolean lastRoundDone = isRoundCompleted(stageMap, displayRounds);
        boolean allRoundsDone = !isRejected && (processComplete || lastRoundDone);

        if (allRoundsDone) {
            LocalDateTime feedbackDate = feedbackDate(stageMap, displayRounds);
            stages.add(completedStage("Feedback Received",
                    feedbackDate != null ? feedbackDate.format(DATE_FORMAT) : "—"));
        } else {
            stages.add(notCompletedStage("Feedback Received"));
        }

        return stages;
    }

    // ─────────────────────────────────────────────────────────────────────
    // DB helpers
    // ─────────────────────────────────────────────────────────────────────

    /**
     * The highest round number that has had an interview request created.
     * Each request is mapped to a round by counting how many ROUND_n history
     * stages already existed when it was created. This is robust against the
     * scheduling flow cancelling the previous round's request, and against a
     * round being rescheduled (which creates multiple requests for the same
     * round without inflating the round number).
     */
    private int fetchScheduledUpToRound(Long jobApplicationId) {
        String sql =
                "SELECT COALESCE(MAX(rn), 0) FROM ( " +
                        "  SELECT ( " +
                        "    SELECT COUNT(*) FROM candidate_history_stages chs " +
                        "    WHERE chs.job_application_id = ? " +
                        "      AND chs.stage LIKE 'ROUND%' " +
                        "      AND chs.created_at <= ir.created_at " +
                        "  ) AS rn " +
                        "  FROM interview_requests ir " +
                        "  WHERE ir.job_application_id = ? " +
                        ") t";
        try {
            Integer v = jdbc.queryForObject(sql, Integer.class,
                    jobApplicationId, jobApplicationId);
            return v != null ? v : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /** roundNumber -> earliest request created_at (the "scheduled on" date). */
    private Map<Integer, LocalDateTime> fetchScheduledDates(Long jobApplicationId) {
        String sql =
                "SELECT rn, MIN(created_at) AS scheduled_at FROM ( " +
                        "  SELECT ir.created_at, ( " +
                        "    SELECT COUNT(*) FROM candidate_history_stages chs " +
                        "    WHERE chs.job_application_id = ? " +
                        "      AND chs.stage LIKE 'ROUND%' " +
                        "      AND chs.created_at <= ir.created_at " +
                        "  ) AS rn " +
                        "  FROM interview_requests ir " +
                        "  WHERE ir.job_application_id = ? " +
                        ") t WHERE rn >= 1 GROUP BY rn";
        Map<Integer, LocalDateTime> map = new HashMap<>();
        try {
            jdbc.query(sql, rs -> {
                int rn = rs.getInt("rn");
                Timestamp ts = rs.getTimestamp("scheduled_at");
                map.put(rn, ts != null ? ts.toLocalDateTime() : null);
            }, jobApplicationId, jobApplicationId);
        } catch (Exception ignored) { /* return whatever we have */ }
        return map;
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
    // Small helpers
    // ─────────────────────────────────────────────────────────────────────

    private boolean isRoundCompleted(Map<String, CandidateHistoryStage> stageMap, int roundNum) {
        CandidateHistoryStage s = stageMap.get("ROUND_" + roundNum);
        return s != null && "COMPLETED".equalsIgnoreCase(s.getStatus());
    }

    /** Shortlist date = when the ROUND_1 stage was created (candidate entered round 1). */
    private String resolveShortlistDate(Map<String, CandidateHistoryStage> stageMap) {
        CandidateHistoryStage explicit = stageMap.get("SHORTLISTED");
        if (explicit != null && explicit.getStageDate() != null)
            return explicit.getStageDate().format(DATE_FORMAT);

        CandidateHistoryStage r1 = stageMap.get("ROUND_1");
        if (r1 != null) {
            LocalDateTime d = r1.getStageDate() != null ? r1.getStageDate() : r1.getCreatedAt();
            if (d != null) return d.format(DATE_FORMAT);
        }
        return "—";
    }

    private LocalDateTime feedbackDate(Map<String, CandidateHistoryStage> stageMap, int lastRound) {
        CandidateHistoryStage hired = stageMap.get("HIRED");
        if (hired != null && hired.getStageDate() != null) return hired.getStageDate();
        CandidateHistoryStage last = stageMap.get("ROUND_" + lastRound);
        return last != null ? last.getStageDate() : null;
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
}
