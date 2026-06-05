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

/**
 * Candidate History Service
 *
 * Derives stage progression from:
 *   1. job_applications.applied_date → "Applied" stage
 *   2. candidate_history_stages table → all other stages
 *   3. job_applications.status → determines which stages are completed
 *
 * Stage order: Applied → Shortlisted → Interview Scheduled → Interview → Feedback Received
 *
 * Status → Stage mapping:
 *   PENDING        → Applied (completed)
 *   SHORTLISTED    → Applied + Shortlisted (completed)
 *   INTERVIEW      → Applied + Shortlisted + Interview Scheduled + Interview (completed)
 *   REJECTED       → shows up to the stage where rejection happened
 */
@Service
public class CandidateHistoryService {

    private final CandidateHistoryStageRepository historyRepository;
    private final ApplicationRepository applicationRepository;
    private final JdbcTemplate jdbc;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    // All stages in order
    private static final List<String> ALL_STAGES = List.of(
            "APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEW", "FEEDBACK_RECEIVED"
    );

    // Display names
    private static final Map<String, String> STAGE_DISPLAY = Map.of(
            "APPLIED", "Applied",
            "SHORTLISTED", "Shortlisted",
            "INTERVIEW_SCHEDULED", "Interview Scheduled",
            "INTERVIEW", "Interview",
            "FEEDBACK_RECEIVED", "Feedback Received"
    );

    // Map job_applications.status → which stages are completed
    private static final Map<String, Integer> STATUS_TO_STAGE_INDEX = new LinkedHashMap<>();
    static {
        STATUS_TO_STAGE_INDEX.put("PENDING", 0);          // Applied only
        STATUS_TO_STAGE_INDEX.put("UNDER_REVIEW", 0);     // Applied only
        STATUS_TO_STAGE_INDEX.put("SHORTLISTED", 1);      // Applied + Shortlisted
        STATUS_TO_STAGE_INDEX.put("ACCEPTED", 1);         // Same as shortlisted
        STATUS_TO_STAGE_INDEX.put("INTERVIEW_SCHEDULED", 2);
        STATUS_TO_STAGE_INDEX.put("INTERVIEW", 3);
        STATUS_TO_STAGE_INDEX.put("INTERVIEWED", 3);
        STATUS_TO_STAGE_INDEX.put("FEEDBACK_RECEIVED", 4);
        STATUS_TO_STAGE_INDEX.put("REJECTED", -1);        // Special handling
    }

    public CandidateHistoryService(CandidateHistoryStageRepository historyRepository,
                                   ApplicationRepository applicationRepository,
                                   JdbcTemplate jdbc) {
        this.historyRepository = historyRepository;
        this.applicationRepository = applicationRepository;
        this.jdbc = jdbc;
    }

    /**
     * Get full history for a specific job application.
     * Combines job_applications data with candidate_history_stages records.
     */
    public CandidateHistoryResponseDTO getHistoryByApplication(Long jobApplicationId) {

        // 1. Get the application
        Application app = applicationRepository.findById(jobApplicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String currentStatus = app.getStatus() != null ? app.getStatus().toUpperCase() : "PENDING";

        // 2. Get the applied date from job_applications using raw SQL
        //    (applied_date or created_at — whichever is available)
        LocalDateTime appliedDate = getAppliedDate(jobApplicationId);

        // 3. Get recorded stages from candidate_history_stages
        List<CandidateHistoryStage> recordedStages =
                historyRepository.findByJobApplicationIdOrderByStageDateAsc(jobApplicationId);

        Map<String, CandidateHistoryStage> stageMap = recordedStages.stream()
                .collect(Collectors.toMap(
                        s -> s.getStage().toUpperCase(),
                        s -> s,
                        (a, b) -> b
                ));

        // 4. Determine how far the candidate has progressed
        int completedUpTo = STATUS_TO_STAGE_INDEX.getOrDefault(currentStatus, -1);

        // For REJECTED: find the highest completed stage before rejection
        if (completedUpTo == -1 && "REJECTED".equals(currentStatus)) {
            completedUpTo = findHighestCompletedStage(stageMap);
        }

        // 5. Build the stage list
        List<HistoryStageDTO> stages = new ArrayList<>();

        for (int i = 0; i < ALL_STAGES.size(); i++) {
            String stageKey = ALL_STAGES.get(i);
            HistoryStageDTO dto = new HistoryStageDTO();
            dto.setStage(STAGE_DISPLAY.getOrDefault(stageKey, stageKey));

            if (i <= completedUpTo) {
                // This stage is completed
                dto.setStatus("Completed");

                if ("APPLIED".equals(stageKey) && appliedDate != null) {
                    // Applied date comes from job_applications
                    dto.setDate(appliedDate.format(DATE_FORMAT));
                } else if (stageMap.containsKey(stageKey)) {
                    // Date from candidate_history_stages
                    CandidateHistoryStage recorded = stageMap.get(stageKey);
                    dto.setDate(recorded.getStageDate() != null
                            ? recorded.getStageDate().format(DATE_FORMAT) : "—");
                } else {
                    dto.setDate("—");
                }
            } else {
                dto.setStatus("Not Completed");
                dto.setDate(null);
            }

            stages.add(dto);
        }

        // 6. Build response
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

    /**
     * Get the applied date from job_applications.
     * Uses applied_date if available, falls back to the earliest timestamp.
     */
    private LocalDateTime getAppliedDate(Long jobApplicationId) {
        try {
            List<Map<String, Object>> rows = jdbc.queryForList(
                    "SELECT applied_date, shortlisted_date FROM job_applications WHERE id = ?",
                    jobApplicationId);

            if (rows.isEmpty()) return null;

            Map<String, Object> row = rows.get(0);

            // Try applied_date first
            Object appliedDate = row.get("applied_date");
            if (appliedDate != null) {
                if (appliedDate instanceof java.sql.Date) {
                    return ((java.sql.Date) appliedDate).toLocalDate().atStartOfDay();
                }
                if (appliedDate instanceof Timestamp) {
                    return ((Timestamp) appliedDate).toLocalDateTime();
                }
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * For rejected candidates, find the highest stage they reached
     * based on recorded history entries.
     */
    private int findHighestCompletedStage(Map<String, CandidateHistoryStage> stageMap) {
        int highest = 0; // At minimum, "Applied" is completed
        for (int i = 0; i < ALL_STAGES.size(); i++) {
            if (stageMap.containsKey(ALL_STAGES.get(i))) {
                highest = i;
            }
        }
        return highest;
    }
}