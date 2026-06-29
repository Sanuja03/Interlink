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
 * Cases handled:
 *   Case 1: Recommended + Confirm → insert shortlisted_candidates, status = SHORTLISTED
 *   Case 2: Not Recommended + Confirm (new) → no insert, status = REJECTED
 *   Case 3: Already shortlisted → show "Shortlisted" (read-only)
 *   Case 4: Already shortlisted → changed to Not Recommended → remove from shortlist, status = REJECTED
 *
 * job_applications.status updates use raw SQL via JdbcTemplate
 * to avoid the "Company_Id" column quoting issue with JPA.
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
    // Check if candidate is already shortlisted
    // ─────────────────────────────────────────────────────────────
    public boolean isAlreadyShortlisted(UUID candidateId, Long jobApplicationId, UUID companyId) {
        return shortlistRepo.existsByCandidateIdAndJobApplicationIdAndCompanyId(
                candidateId, jobApplicationId, companyId);
    }

    // ─────────────────────────────────────────────────────────────
    // Get existing shortlist entry for a candidate
    // ─────────────────────────────────────────────────────────────
    public ShortlistedCandidate getExistingShortlist(UUID candidateId, Long jobApplicationId, UUID companyId) {
        String sql = "SELECT * FROM shortlisted_candidates " +
                "WHERE candidate_id = ? AND job_application_id = ? AND company_id = ? " +
                "LIMIT 1";
        List<ShortlistedCandidate> results = jdbc.query(sql,
                new Object[]{candidateId, jobApplicationId, companyId},
                (rs, rowNum) -> {
                    ShortlistedCandidate sc = new ShortlistedCandidate();
                    sc.setCandidateId((UUID) rs.getObject("candidate_id"));
                    sc.setCompanyId((UUID) rs.getObject("company_id"));
                    sc.setJobApplicationId(rs.getLong("job_application_id"));
                    sc.setAiScore(rs.getObject("ai_score") != null ? rs.getDouble("ai_score") : null);
                    sc.setAiSuggestion(rs.getString("ai_suggestion"));
                    sc.setManualDecision(rs.getString("manual_decision"));
                    sc.setManualNotes(rs.getString("manual_notes"));
                    sc.setFinalStatus(rs.getString("final_status"));
                    sc.setStatus(rs.getString("status"));
                    return sc;
                });
        return results.isEmpty() ? null : results.get(0);
    }

    // ─────────────────────────────────────────────────────────────
    // Case 1: Recommended + Confirm → shortlist
    // ─────────────────────────────────────────────────────────────
    public ShortlistResponseDTO shortlistCandidate(ShortlistRequestDTO request) {

        // Check if already shortlisted
        if (shortlistRepo.existsByCandidateIdAndJobApplicationIdAndCompanyId(
                request.getCandidateId(), request.getJobApplicationId(), request.getCompanyId())) {
            throw new RuntimeException("Candidate already shortlisted for this job");
        }

        Application app = applicationRepo.findById(request.getJobApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String aiSuggestion = (app.getScore() != null && app.getScore() <= 70)
                ? "Recommended" : "Not Recommended";

        ShortlistedCandidate sc = new ShortlistedCandidate();
        sc.setCandidateId(request.getCandidateId());
        sc.setCompanyId(request.getCompanyId());
        sc.setJobApplicationId(request.getJobApplicationId());
        sc.setAiScore(app.getScore());
        sc.setAiSuggestion(aiSuggestion);
        sc.setManualDecision(request.getManualDecision());
        sc.setManualNotes(request.getManualNotes());
        sc.setFinalStatus("Recommended");
        sc.setStatus("SHORTLISTED");
        sc.setShortlistedAt(LocalDateTime.now());
        sc.setCreatedAt(LocalDateTime.now());
        sc.setUpdatedAt(LocalDateTime.now());

        ShortlistedCandidate saved = shortlistRepo.save(sc);

        // Update job_applications status using raw SQL (avoids Company_Id issue)
        updateApplicationStatus(request.getJobApplicationId(), "SHORTLISTED");

        return toDTO(saved, app, resolveCandidateName(saved.getCandidateId(), app));
    }

    // ─────────────────────────────────────────────────────────────
    // Case 2: Not Recommended + Confirm (new candidate)
    // Does NOT insert into shortlisted_candidates, just rejects
    // ─────────────────────────────────────────────────────────────
    public ShortlistResponseDTO rejectCandidate(ShortlistRequestDTO request) {

        Application app = applicationRepo.findById(request.getJobApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Update job_applications status using raw SQL
        updateApplicationStatus(request.getJobApplicationId(), "REJECTED");

        // Build response DTO without saving to shortlisted_candidates
        ShortlistResponseDTO dto = new ShortlistResponseDTO();
        dto.setCandidateId(request.getCandidateId());
        dto.setCandidateName(resolveCandidateName(request.getCandidateId(), app));
        dto.setJobId(app.getJobId());
        dto.setJobPostId(app.getJobId() != null ? "JOB" + app.getJobId() : null);
        dto.setJobTitle(app.getJobTitle());
        dto.setJobApplicationId(request.getJobApplicationId());
        dto.setAiScore(app.getScore());
        dto.setAiSuggestion((app.getScore() != null && app.getScore() >= 70)
                ? "Recommended" : "Not Recommended");
        dto.setManualDecision("Not Recommended");
        dto.setManualNotes(request.getManualNotes());
        dto.setFinalStatus("REJECTED");
        dto.setStatus("REJECTED");

        return dto;
    }

    // ─────────────────────────────────────────────────────────────
    // Case 4: Already shortlisted → changed to Not Recommended
    // Remove from shortlisted_candidates + reject
    // ─────────────────────────────────────────────────────────────
    public ShortlistResponseDTO removeAndReject(ShortlistRequestDTO request) {

        Application app = applicationRepo.findById(request.getJobApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Remove from shortlisted_candidates using raw SQL
        jdbc.update("DELETE FROM shortlisted_candidates " +
                        "WHERE candidate_id = ? AND job_application_id = ? AND company_id = ?",
                request.getCandidateId(), request.getJobApplicationId(), request.getCompanyId());

        // Update job_applications status
        updateApplicationStatus(request.getJobApplicationId(), "REJECTED");

        // Build response
        ShortlistResponseDTO dto = new ShortlistResponseDTO();
        dto.setCandidateId(request.getCandidateId());
        dto.setCandidateName(resolveCandidateName(request.getCandidateId(), app));
        dto.setJobId(app.getJobId());
        dto.setJobPostId(app.getJobId() != null ? "JOB" + app.getJobId() : null);
        dto.setJobTitle(app.getJobTitle());
        dto.setJobApplicationId(request.getJobApplicationId());
        dto.setAiScore(app.getScore());
        dto.setAiSuggestion((app.getScore() != null && app.getScore() >= 70)
                ? "Recommended" : "Not Recommended");
        dto.setManualDecision("Not Recommended");
        dto.setManualNotes(request.getManualNotes());
        dto.setFinalStatus("REJECTED");
        dto.setStatus("REJECTED");

        return dto;
    }

    // ─────────────────────────────────────────────────────────────
    // Update job_applications.status using raw SQL
    // This avoids the "Company_Id" column quoting issue with JPA
    // ─────────────────────────────────────────────────────────────
    private void updateApplicationStatus(Long applicationId, String status) {
        jdbc.update("UPDATE job_applications SET status = ?::application_status WHERE id = ?",
                status, applicationId);
    }

    // ─────────────────────────────────────────────────────────────
    // Read: all shortlisted for a company, grouped by job
    // ─────────────────────────────────────────────────────────────
    public List<ShortlistedByJobDTO> getShortlistedByCompany(UUID companyId) {

        List<ShortlistedCandidate> all = shortlistRepo.findByCompanyIdOrderByIdAsc(companyId);
        if (all.isEmpty()) return new ArrayList<>();

        Set<Long> appIds = new HashSet<>();
        Set<UUID> candidateIds = new HashSet<>();
        for (ShortlistedCandidate sc : all) {
            appIds.add(sc.getJobApplicationId());
            candidateIds.add(sc.getCandidateId());
        }
        Map<Long, Application> appMap = loadApplications(appIds);
        Map<UUID, String> nameMap = loadCandidateNames(candidateIds);

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
        String fromApp = app != null ? safeCandidateName(app) : null;
        if (fromApp != null && !fromApp.isEmpty()) return fromApp;
        Map<UUID, String> m = loadCandidateNames(Collections.singleton(candidateId));
        return m.get(candidateId);
    }

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

        // Derive the current round from candidate_history_stages:
        // count how many INTERVIEW-stage rows exist for this candidate+application.
        // Round 1 = 1 completed interview stage, Round 2 = 2, etc.
        // A newly promoted candidate (no stages yet) defaults to round 1.
        Integer round = resolveRound(sc.getCandidateId(), sc.getJobApplicationId());
        dto.setRound(round);

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

    // ─────────────────────────────────────────────────────────────
    // Derive the current round for a shortlisted candidate.
    // Count completed INTERVIEW stages → that tells us which round
    // the candidate is currently being shortlisted for.
    // 0 completed → Round 1, 1 completed → Round 2, etc.
    // ─────────────────────────────────────────────────────────────
    private Integer resolveRound(UUID candidateId, Long jobApplicationId) {
        try {
            String sql = "SELECT COUNT(*) FROM candidate_history_stages " +
                    "WHERE candidate_id = ? AND job_application_id = ? " +
                    "AND stage = 'INTERVIEW' AND status = 'COMPLETED'";
            Long completed = jdbc.queryForObject(sql, Long.class, candidateId, jobApplicationId);
            return (completed != null ? completed.intValue() : 0) + 1;
        } catch (Exception e) {
            return 1;
        }
    }
}