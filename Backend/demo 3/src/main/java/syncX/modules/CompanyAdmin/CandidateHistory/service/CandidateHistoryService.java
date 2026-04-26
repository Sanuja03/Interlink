package syncX.modules.CompanyAdmin.CandidateHistory.service;

import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.CandidateHistory.dto.CandidateHistoryResponseDTO;
import syncX.modules.CompanyAdmin.CandidateHistory.dto.HistoryStageDTO;
import syncX.modules.CompanyAdmin.CandidateHistory.entity.CandidateHistoryStage;
import syncX.modules.CompanyAdmin.CandidateHistory.repository.CandidateHistoryStageRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;
import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationRepository;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CandidateHistoryService {

    private final CandidateHistoryStageRepository historyRepository;
    private final ApplicationRepository applicationRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    // All possible stages in order
    private static final List<String> ALL_STAGES = List.of(
            "APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEW", "FEEDBACK_RECEIVED"
    );

    // Display names
    private static final Map<String, String> STAGE_DISPLAY_NAMES = Map.of(
            "APPLIED", "Applied",
            "SHORTLISTED", "Shortlisted",
            "INTERVIEW_SCHEDULED", "Interview Scheduled",
            "INTERVIEW", "Interview",
            "FEEDBACK_RECEIVED", "Feedback Received",
            "REJECTED", "Rejected"
    );

    public CandidateHistoryService(CandidateHistoryStageRepository historyRepository,
                                   ApplicationRepository applicationRepository) {
        this.historyRepository = historyRepository;
        this.applicationRepository = applicationRepository;
    }

    /**
     * Get full history for a specific job application
     */
    public CandidateHistoryResponseDTO getHistoryByApplication(Long jobApplicationId) {

        // Get the application
        Application app = applicationRepository.findById(jobApplicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Get completed stages from DB
        List<CandidateHistoryStage> completedStages =
                historyRepository.findByJobApplicationIdOrderByStageDateAsc(jobApplicationId);

        // Build a map of completed stages
        Map<String, CandidateHistoryStage> completedMap = completedStages.stream()
                .collect(Collectors.toMap(
                        CandidateHistoryStage::getStage,
                        s -> s,
                        (a, b) -> b // if duplicate, keep latest
                ));

        // Build the full stage list (completed + not completed)
        List<HistoryStageDTO> stageDTOs = new ArrayList<>();

        for (String stage : ALL_STAGES) {
            HistoryStageDTO dto = new HistoryStageDTO();
            dto.setStage(STAGE_DISPLAY_NAMES.getOrDefault(stage, stage));

            if (completedMap.containsKey(stage)) {
                CandidateHistoryStage completed = completedMap.get(stage);
                dto.setStatus("Completed");
                dto.setDate(completed.getStageDate() != null
                        ? completed.getStageDate().format(DATE_FORMAT) : null);
                dto.setAiScore(completed.getAiScore());
            } else {
                dto.setStatus("Not Completed");
                dto.setDate(null);
                dto.setAiScore(null);
            }

            stageDTOs.add(dto);
        }

        // If rejected, add rejected stage
        if (completedMap.containsKey("REJECTED")) {
            CandidateHistoryStage rejected = completedMap.get("REJECTED");
            HistoryStageDTO rejectedDto = new HistoryStageDTO();
            rejectedDto.setStage("Rejected");
            rejectedDto.setStatus("Completed");
            rejectedDto.setDate(rejected.getStageDate() != null
                    ? rejected.getStageDate().format(DATE_FORMAT) : null);
            rejectedDto.setAiScore(rejected.getAiScore());
            stageDTOs.add(rejectedDto);
        }

        // Build response
        CandidateHistoryResponseDTO response = new CandidateHistoryResponseDTO();
        response.setCandidateId(app.getCandidateId());
        response.setCandidateName(app.getCandidateName());
        response.setJobTitle(app.getJobTitle());
        response.setJobApplicationId(jobApplicationId);
        response.setAiScore(app.getScore());
        response.setStages(stageDTOs);

        return response;
    }
}