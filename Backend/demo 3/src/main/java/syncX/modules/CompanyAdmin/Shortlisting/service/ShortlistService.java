package syncX.modules.CompanyAdmin.Shortlisting.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import syncX.modules.CompanyAdmin.Shortlisting.dto.*;
import syncX.modules.CompanyAdmin.Shortlisting.entity.ShortlistedCandidate;
import syncX.modules.CompanyAdmin.Shortlisting.repository.ShortlistedCandidateRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;
import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationRepository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;


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


    public boolean isAlreadyShortlisted(UUID candidateId, Long jobApplicationId, UUID companyId) {
        return shortlistRepo.existsByCandidateIdAndJobApplicationIdAndCompanyId(
                candidateId, jobApplicationId, companyId);
    }


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


    @Transactional
    public ShortlistResponseDTO shortlistCandidate(ShortlistRequestDTO request) {

        if (shortlistRepo.existsByCandidateIdAndJobApplicationIdAndCompanyId(
                request.getCandidateId(), request.getJobApplicationId(), request.getCompanyId())) {
            throw new RuntimeException("Candidate already shortlisted for this job");
        }

        Application app = applicationRepo.findById(request.getJobApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String aiSuggestion = (app.getScore() != null && app.getScore() >= 70)
                ? "Recommended" : "Not Recommended";

        // 1. Insert APPLIED history stage if not already there
        insertHistoryStageIfAbsent(request.getCandidateId(), request.getCompanyId(),
                request.getJobApplicationId(), app.getJobId(), "APPLIED");

        // 2. Insert SHORTLISTED / ROUND_1 history stage and get its generated id
        Long historyStageId = insertHistoryStageReturningId(
                request.getCandidateId(), request.getCompanyId(),
                request.getJobApplicationId(), app.getJobId(), "ROUND_1");

        // 3. Save the shortlisted_candidates row
        ShortlistedCandidate sc = new ShortlistedCandidate();
        sc.setCandidateId(request.getCandidateId());
        sc.setCompanyId(request.getCompanyId());
        sc.setJobApplicationId(request.getJobApplicationId());
        sc.setHistoryId(historyStageId);
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

        // 4. Update job_applications status
        updateApplicationStatus(request.getJobApplicationId(), "SHORTLISTED");

        return toDTO(saved, app, resolveCandidateName(saved.getCandidateId(), app));
    }


    @Transactional
    public ShortlistResponseDTO rejectCandidate(ShortlistRequestDTO request) {

        Application app = applicationRepo.findById(request.getJobApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Save APPLIED + REJECTED history stages
        insertHistoryStageIfAbsent(request.getCandidateId(), request.getCompanyId(),
                request.getJobApplicationId(), app.getJobId(), "APPLIED");
        insertHistoryStageIfAbsent(request.getCandidateId(), request.getCompanyId(),
                request.getJobApplicationId(), app.getJobId(), "REJECTED");

        updateApplicationStatus(request.getJobApplicationId(), "REJECTED");

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


    @Transactional
    public ShortlistResponseDTO removeAndReject(ShortlistRequestDTO request) {

        Application app = applicationRepo.findById(request.getJobApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        jdbc.update("DELETE FROM shortlisted_candidates " +
                        "WHERE candidate_id = ? AND job_application_id = ? AND company_id = ?",
                request.getCandidateId(), request.getJobApplicationId(), request.getCompanyId());

        // Add REJECTED history stage
        insertHistoryStageIfAbsent(request.getCandidateId(), request.getCompanyId(),
                request.getJobApplicationId(), app.getJobId(), "REJECTED");

        updateApplicationStatus(request.getJobApplicationId(), "REJECTED");

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


    private void updateApplicationStatus(Long applicationId, String status) {
        jdbc.update("UPDATE job_applications SET status = ?::application_status WHERE id = ?",
                status, applicationId);
    }


    private void insertHistoryStageIfAbsent(UUID candidateId, UUID companyId,
                                            Long jobApplicationId, Long jobId, String stage) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM candidate_history_stages " +
                        "WHERE job_application_id = ? AND stage = ?",
                Integer.class, jobApplicationId, stage);
        if (count == null || count == 0) {
            jdbc.update(
                    "INSERT INTO candidate_history_stages " +
                            "(candidate_id, company_id, job_application_id, job_id, stage, status, stage_date, created_at) " +
                            "VALUES (?, ?, ?, ?, ?, 'COMPLETED', NOW(), NOW())",
                    candidateId, companyId, jobApplicationId, jobId, stage);
        }
    }


    private Long insertHistoryStageReturningId(UUID candidateId, UUID companyId,
                                               Long jobApplicationId, Long jobId, String stage) {
        // If a row already exists for this stage, return its id
        List<Long> existing = jdbc.queryForList(
                "SELECT id FROM candidate_history_stages " +
                        "WHERE job_application_id = ? AND stage = ? LIMIT 1",
                Long.class, jobApplicationId, stage);
        if (!existing.isEmpty()) return existing.get(0);

        KeyHolder holder = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO candidate_history_stages " +
                            "(candidate_id, company_id, job_application_id, job_id, stage, status, stage_date, created_at) " +
                            "VALUES (?, ?, ?, ?, ?, 'NOT_COMPLETED', NOW(), NOW())",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setObject(1, candidateId);
            ps.setObject(2, companyId);
            ps.setLong(3, jobApplicationId);
            if (jobId != null) ps.setLong(4, jobId); else ps.setNull(4, java.sql.Types.BIGINT);
            ps.setString(5, stage);
            return ps;
        }, holder);

        Map<String, Object> keys = holder.getKeys();
        if (keys != null && keys.containsKey("id")) {
            Object idVal = keys.get("id");
            if (idVal instanceof Number n) return n.longValue();
        }
        return null;
    }


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