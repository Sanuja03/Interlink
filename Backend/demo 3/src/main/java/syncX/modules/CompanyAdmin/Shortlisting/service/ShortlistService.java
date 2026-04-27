package syncX.modules.CompanyAdmin.Shortlisting.service;

import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.Shortlisting.dto.*;
import syncX.modules.CompanyAdmin.Shortlisting.entity.ShortlistedCandidate;
import syncX.modules.CompanyAdmin.Shortlisting.repository.ShortlistedCandidateRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;
import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShortlistService {

    private final ShortlistedCandidateRepository shortlistRepo;
    private final ApplicationRepository applicationRepo;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public ShortlistService(ShortlistedCandidateRepository shortlistRepo,
                            ApplicationRepository applicationRepo) {
        this.shortlistRepo = shortlistRepo;
        this.applicationRepo = applicationRepo;
    }

    public ShortlistResponseDTO shortlistCandidate(ShortlistRequestDTO request) {

        if (shortlistRepo.existsByCandidateIdAndJobApplicationIdAndCompanyId(
                request.getCandidateId(), request.getJobApplicationId(), request.getCompanyId())) {
            throw new RuntimeException("Candidate already shortlisted for this job");
        }

        Application app = applicationRepo.findById(request.getJobApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String aiSuggestion = "Not Recommended";
        if (app.getScore() != null && app.getScore() >= 70) {
            aiSuggestion = "Recommended";
        }

        ShortlistedCandidate sc = new ShortlistedCandidate();
        sc.setCandidateId(request.getCandidateId());
        sc.setCompanyId(request.getCompanyId());
        sc.setJobApplicationId(request.getJobApplicationId());
        sc.setAiScore(app.getScore());
        sc.setAiSuggestion(aiSuggestion);
        sc.setManualDecision(request.getManualDecision());
        sc.setManualNotes(request.getManualNotes());
        sc.setFinalStatus(request.getManualDecision() != null ? request.getManualDecision() : aiSuggestion);
        sc.setStatus("SHORTLISTED");
        sc.setShortlistedAt(LocalDateTime.now());
        sc.setCreatedAt(LocalDateTime.now());
        sc.setUpdatedAt(LocalDateTime.now());

        ShortlistedCandidate saved = shortlistRepo.save(sc);

        app.setStatus("SHORTLISTED");
        applicationRepo.save(app);

        return toDTO(saved, app);
    }

    public ShortlistResponseDTO rejectCandidate(ShortlistRequestDTO request) {

        Application app = applicationRepo.findById(request.getJobApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus("REJECTED");
        applicationRepo.save(app);

        ShortlistedCandidate sc = new ShortlistedCandidate();
        sc.setCandidateId(request.getCandidateId());
        sc.setCompanyId(request.getCompanyId());
        sc.setJobApplicationId(request.getJobApplicationId());
        sc.setAiScore(app.getScore());
        sc.setAiSuggestion(app.getScore() != null && app.getScore() >= 70 ? "Recommended" : "Not Recommended");
        sc.setManualDecision("Reject");
        sc.setManualNotes(request.getManualNotes());
        sc.setFinalStatus("REJECTED");
        sc.setStatus("REJECTED");
        sc.setShortlistedAt(LocalDateTime.now());
        sc.setCreatedAt(LocalDateTime.now());
        sc.setUpdatedAt(LocalDateTime.now());

        return toDTO(shortlistRepo.save(sc), app);
    }

    public List<ShortlistedByJobDTO> getShortlistedByCompany(UUID companyId) {

        List<ShortlistedCandidate> all = shortlistRepo.findByCompanyIdOrderByIdAsc(companyId);

        // Look up application details for each shortlisted candidate
        Map<Long, Application> appMap = new HashMap<>();
        for (ShortlistedCandidate sc : all) {
            if (!appMap.containsKey(sc.getJobApplicationId())) {
                applicationRepo.findById(sc.getJobApplicationId())
                        .ifPresent(app -> appMap.put(sc.getJobApplicationId(), app));
            }
        }

        // Group by jobId (from application)
        Map<Long, List<ShortlistedCandidate>> grouped = new LinkedHashMap<>();
        for (ShortlistedCandidate sc : all) {
            Application app = appMap.get(sc.getJobApplicationId());
            Long jobId = app != null ? app.getJobId() : 0L;
            grouped.computeIfAbsent(jobId, k -> new ArrayList<>()).add(sc);
        }

        List<ShortlistedByJobDTO> result = new ArrayList<>();

        for (Map.Entry<Long, List<ShortlistedCandidate>> entry : grouped.entrySet()) {
            ShortlistedByJobDTO jobDTO = new ShortlistedByJobDTO();
            jobDTO.setJobId(entry.getKey());

            List<ShortlistedCandidate> candidates = entry.getValue();
            Application firstApp = appMap.get(candidates.get(0).getJobApplicationId());
            jobDTO.setJobTitle(firstApp != null ? firstApp.getJobTitle() : "Unknown");
            jobDTO.setShortlistedCount(candidates.size());
            jobDTO.setCandidates(candidates.stream()
                    .map(sc -> toDTO(sc, appMap.get(sc.getJobApplicationId())))
                    .collect(Collectors.toList()));

            result.add(jobDTO);
        }

        return result;
    }

    public List<ShortlistResponseDTO> getShortlistedByJob(UUID companyId, Long jobId) {
        List<ShortlistedCandidate> candidates = shortlistRepo.findByCompanyIdAndJobId(companyId, jobId);
        return candidates.stream()
                .map(sc -> {
                    Application app = applicationRepo.findById(sc.getJobApplicationId()).orElse(null);
                    return toDTO(sc, app);
                })
                .collect(Collectors.toList());
    }

    private ShortlistResponseDTO toDTO(ShortlistedCandidate sc, Application app) {
        ShortlistResponseDTO dto = new ShortlistResponseDTO();
        dto.setShortlistId(sc.getId());
        dto.setCandidateId(sc.getCandidateId());
        dto.setCandidateName(app != null ? app.getCandidateName() : null);
        dto.setJobId(app != null ? app.getJobId() : null);
        dto.setJobTitle(app != null ? app.getJobTitle() : null);
        dto.setJobApplicationId(sc.getJobApplicationId());
        dto.setHistoryId(sc.getHistoryId());
        dto.setAiScore(sc.getAiScore());
        dto.setAiSuggestion(sc.getAiSuggestion());
        dto.setManualDecision(sc.getManualDecision());
        dto.setManualNotes(sc.getManualNotes());
        dto.setFinalStatus(sc.getFinalStatus());
        dto.setStatus(sc.getStatus());
        if (sc.getShortlistedAt() != null) {
            dto.setShortlistedAt(sc.getShortlistedAt().format(DATE_FORMAT));
        }
        return dto;
    }
}