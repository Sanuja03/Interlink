package syncX.modules.CompanyAdmin.Shortlisting.service;

import org.springframework.jdbc.core.JdbcTemplate;
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

/**
 * Shortlisting business logic.
 *
 * Writes (shortlist / reject) live in this service.
 * Reads still flow through here, but the page-level read endpoints
 * (the ones the React frontend talks to) are exposed by
 * {@link syncX.modules.ShortlistedCandidates.controller.ShortlistedCandidatesController}
 * and read directly via SQL because they need a JWT-scoped, joined view
 * (candidate name + job title + jobPostId synthesis) that doesn't map
 * cleanly onto our JPA entities.
 *
 * The two paths point at the same {@code shortlisted_candidates} table,
 * so they stay consistent automatically.
 */
@Service
public class ShortlistService {

    private final ShortlistedCandidateRepository shortlistRepo;
    private final ApplicationRepository applicationRepo;
    private final JdbcTemplate jdbc;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public ShortlistService(ShortlistedCandidateRepository shortlistRepo,
                            ApplicationRepository applicationRepo,
                            JdbcTemplate jdbc) {
        this.shortlistRepo = shortlistRepo;
        this.applicationRepo = applicationRepo;
        this.jdbc = jdbc;
    }

    // ─────────────────────────────────────────────────────────────
    // Write: shortlist a candidate
    // ─────────────────────────────────────────────────────────────
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

        return toDTO(saved, app, resolveCandidateName(saved.getCandidateId(), app));
    }

    // ─────────────────────────────────────────────────────────────
    // Write: reject a candidate
    // ─────────────────────────────────────────────────────────────
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

        ShortlistedCandidate saved = shortlistRepo.save(sc);
        return toDTO(saved, app, resolveCandidateName(saved.getCandidateId(), app));
    }

    // ─────────────────────────────────────────────────────────────
    // Read: all shortlisted for a company, grouped by job
    // ─────────────────────────────────────────────────────────────
    public List<ShortlistedByJobDTO> getShortlistedByCompany(UUID companyId) {

        List<ShortlistedCandidate> all = shortlistRepo.findByCompanyIdOrderByIdAsc(companyId);
        if (all.isEmpty()) return new ArrayList<>();

        // Batch-load applications (no N+1)
        Set<Long> appIds = new HashSet<>();
        Set<UUID> candidateIds = new HashSet<>();
        for (ShortlistedCandidate sc : all) {
            appIds.add(sc.getJobApplicationId());
            candidateIds.add(sc.getCandidateId());
        }
        Map<Long, Application> appMap = loadApplications(appIds);
        Map<UUID, String> nameMap = loadCandidateNames(candidateIds);

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
                    .map(sc -> toDTO(sc,
                            appMap.get(sc.getJobApplicationId()),
                            nameMap.get(sc.getCandidateId())))
                    .collect(Collectors.toList()));

            result.add(jobDTO);
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────
    // Read: shortlisted for a company + a specific job
    // ─────────────────────────────────────────────────────────────
    public List<ShortlistResponseDTO> getShortlistedByJob(UUID companyId, Long jobId) {
        List<ShortlistedCandidate> candidates = shortlistRepo.findByCompanyIdAndJobId(companyId, jobId);
        if (candidates.isEmpty()) return new ArrayList<>();

        Set<Long> appIds = candidates.stream()
                .map(ShortlistedCandidate::getJobApplicationId)
                .collect(Collectors.toSet());
        Set<UUID> candIds = candidates.stream()
                .map(ShortlistedCandidate::getCandidateId)
                .collect(Collectors.toSet());

        Map<Long, Application> appMap = loadApplications(appIds);
        Map<UUID, String> nameMap = loadCandidateNames(candIds);

        return candidates.stream()
                .map(sc -> toDTO(sc,
                        appMap.get(sc.getJobApplicationId()),
                        nameMap.get(sc.getCandidateId())))
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────
    private Map<Long, Application> loadApplications(Set<Long> appIds) {
        if (appIds.isEmpty()) return Collections.emptyMap();
        Map<Long, Application> map = new HashMap<>();
        for (Application a : applicationRepo.findAllById(appIds)) {
            map.put(a.getId(), a);
        }
        return map;
    }

    private Map<UUID, String> loadCandidateNames(Set<UUID> candidateIds) {
        if (candidateIds.isEmpty()) return Collections.emptyMap();
        Map<UUID, String> result = new HashMap<>();
        // One round-trip; safe because candidateIds is bounded by page size.
        String sql = "SELECT candidate_id, " +
                "       TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')) AS full_name " +
                "FROM public.candidates WHERE candidate_id = ANY (?)";
        UUID[] ids = candidateIds.toArray(new UUID[0]);
        jdbc.query(sql,
                ps -> ps.setArray(1, ps.getConnection().createArrayOf("uuid", ids)),
                (rs, rowNum) -> {
                    UUID id = (UUID) rs.getObject("candidate_id");
                    String name = rs.getString("full_name");
                    result.put(id, (name == null || name.isEmpty()) ? null : name);
                    return null;
                });
        return result;
    }

    private String resolveCandidateName(UUID candidateId, Application app) {
        // Prefer Application's candidate name if present, otherwise fall back
        // to a single-row lookup against the candidates table.
        String fromApp = app != null ? safeCandidateName(app) : null;
        if (fromApp != null && !fromApp.isEmpty()) return fromApp;
        Map<UUID, String> m = loadCandidateNames(Collections.singleton(candidateId));
        return m.get(candidateId);
    }

    /** Defensive: Application may or may not expose getCandidateName(). */
    private String safeCandidateName(Application app) {
        try {
            return app.getCandidateName();
        } catch (Throwable ignored) {
            return null;
        }
    }

    private ShortlistResponseDTO toDTO(ShortlistedCandidate sc, Application app, String candidateName) {
        ShortlistResponseDTO dto = new ShortlistResponseDTO();
        dto.setShortlistId(sc.getId());
        dto.setCandidateId(sc.getCandidateId());
        dto.setCandidateName(candidateName);
        Long jobId = app != null ? app.getJobId() : null;
        dto.setJobId(jobId);
        dto.setJobPostId(jobId != null ? "JOB" + jobId : null);
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