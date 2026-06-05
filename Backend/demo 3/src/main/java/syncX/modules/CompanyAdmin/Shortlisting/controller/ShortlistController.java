package syncX.modules.CompanyAdmin.Shortlisting.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import syncX.modules.CompanyAdmin.Shortlisting.dto.*;
import syncX.modules.CompanyAdmin.Shortlisting.entity.ShortlistedCandidate;
import syncX.modules.CompanyAdmin.Shortlisting.service.ShortlistService;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.repository.CompanyRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class ShortlistController {

    private final ShortlistService shortlistService;

    @Autowired private CompanyRepository companyRepository;
    @Autowired private JdbcTemplate jdbc;

    public ShortlistController(ShortlistService shortlistService) {
        this.shortlistService = shortlistService;
    }

    // ═════════════════════════════════════════════════════════════
    // Check shortlist status for a candidate
    // ═════════════════════════════════════════════════════════════

    @GetMapping("/api/company/shortlist/status")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<Map<String, Object>> checkShortlistStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam UUID candidateId,
            @RequestParam Long jobApplicationId) {

        UUID companyId = resolveCompanyId(jwt);
        boolean isShortlisted = shortlistService.isAlreadyShortlisted(candidateId, jobApplicationId, companyId);

        Map<String, Object> result = new HashMap<>();
        result.put("isShortlisted", isShortlisted);

        if (isShortlisted) {
            ShortlistedCandidate sc = shortlistService.getExistingShortlist(candidateId, jobApplicationId, companyId);
            if (sc != null) {
                result.put("finalStatus", sc.getFinalStatus());
                result.put("manualDecision", sc.getManualDecision());
                result.put("manualNotes", sc.getManualNotes());
                result.put("status", sc.getStatus());
            }
        }

        return ResponseEntity.ok(result);
    }

    // ═════════════════════════════════════════════════════════════
    // Case 1: Recommended + Confirm → shortlist
    // ═════════════════════════════════════════════════════════════

    @PostMapping("/api/company/shortlist")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<ShortlistResponseDTO> shortlistCandidate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ShortlistRequestDTO request) {
        request.setCompanyId(resolveCompanyId(jwt));
        return ResponseEntity.ok(shortlistService.shortlistCandidate(request));
    }

    // ═════════════════════════════════════════════════════════════
    // Case 2: Not Recommended + Confirm (new candidate) → reject only
    // ═════════════════════════════════════════════════════════════

    @PostMapping("/api/company/shortlist/reject")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<ShortlistResponseDTO> rejectCandidate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ShortlistRequestDTO request) {
        request.setCompanyId(resolveCompanyId(jwt));
        return ResponseEntity.ok(shortlistService.rejectCandidate(request));
    }

    // ═════════════════════════════════════════════════════════════
    // Case 4: Already shortlisted → changed to Not Recommended
    // Remove from shortlist + reject
    // ═════════════════════════════════════════════════════════════

    @PostMapping("/api/company/shortlist/remove-and-reject")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<ShortlistResponseDTO> removeAndReject(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ShortlistRequestDTO request) {
        request.setCompanyId(resolveCompanyId(jwt));
        return ResponseEntity.ok(shortlistService.removeAndReject(request));
    }

    // ═════════════════════════════════════════════════════════════
    // DTO-based reads
    // ═════════════════════════════════════════════════════════════

    @GetMapping("/api/company/shortlist/me")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<ShortlistedByJobDTO>> getMine(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(shortlistService.getShortlistedByCompany(resolveCompanyId(jwt)));
    }

    @GetMapping("/api/company/shortlist/me/job/{jobId}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<ShortlistResponseDTO>> getMineByJob(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(shortlistService.getShortlistedByJob(resolveCompanyId(jwt), jobId));
    }

    @GetMapping("/api/company/shortlist/company/{companyId}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<ShortlistedByJobDTO>> getByCompany(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID companyId) {
        UUID my = resolveCompanyId(jwt);
        if (!my.equals(companyId)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(shortlistService.getShortlistedByCompany(companyId));
    }

    @GetMapping("/api/company/shortlist/company/{companyId}/job/{jobId}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<ShortlistResponseDTO>> getByJob(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID companyId,
            @PathVariable Long jobId) {
        UUID my = resolveCompanyId(jwt);
        if (!my.equals(companyId)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(shortlistService.getShortlistedByJob(companyId, jobId));
    }

    // ═════════════════════════════════════════════════════════════
    // Page-level reads
    // ═════════════════════════════════════════════════════════════

    @GetMapping("/api/company/shortlisted-candidates/jobs")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<Map<String, Object>>> listJobsWithShortlisted(
            @AuthenticationPrincipal Jwt jwt) {

        UUID companyId = resolveCompanyId(jwt);
        String sql =
                "SELECT DISTINCT j.id AS job_id, j.job_title AS job_title " +
                        "FROM public.shortlisted_candidates sc " +
                        "JOIN public.job_applications ja ON ja.id = sc.job_application_id " +
                        "JOIN public.jobs j              ON j.id  = ja.job_id " +
                        "WHERE sc.company_id = ? " +
                        "  AND UPPER(COALESCE(sc.status, 'SHORTLISTED')) = 'SHORTLISTED' " +
                        "ORDER BY j.id DESC";

        List<Map<String, Object>> rows = jdbc.query(sql, new Object[]{ companyId }, (rs, rowNum) -> {
            Map<String, Object> m = new HashMap<>();
            long jId = rs.getLong("job_id");
            m.put("jobId", jId);
            m.put("jobTitle", rs.getString("job_title"));
            m.put("jobPostId", "JOB" + jId);
            return m;
        });

        return ResponseEntity.ok(rows);
    }

    @GetMapping("/api/company/shortlisted-candidates")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<Map<String, Object>>> listShortlisted(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long jobId) {

        UUID companyId = resolveCompanyId(jwt);
        StringBuilder sql = new StringBuilder()
                .append("SELECT ")
                .append("  sc.candidate_id, sc.job_application_id, ja.job_id, ")
                .append("  sc.history_id, ")
                .append("  c.first_name || ' ' || c.last_name AS candidate_name, ")
                .append("  COALESCE(j.job_title, ja.job_title) AS job_title, ")
                .append("  sc.company_id ")
                .append("FROM public.shortlisted_candidates sc ")
                .append("JOIN public.candidates c ON c.candidate_id = sc.candidate_id ")
                .append("JOIN public.job_applications ja ON ja.id = sc.job_application_id ")
                .append("LEFT JOIN public.jobs j ON j.id = ja.job_id ")
                .append("WHERE sc.company_id = ? ")
                .append("  AND UPPER(COALESCE(sc.status, 'SHORTLISTED')) = 'SHORTLISTED' ");

        Object[] args;
        if (jobId != null) {
            sql.append("AND ja.job_id = ? ");
            args = new Object[]{ companyId, jobId };
        } else {
            args = new Object[]{ companyId };
        }
        sql.append("ORDER BY sc.shortlisted_at DESC");

        List<Map<String, Object>> rows = jdbc.query(sql.toString(), args, (rs, rowNum) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("candidateId", rs.getString("candidate_id"));
            m.put("jobApplicationId", rs.getLong("job_application_id"));
            long jId = rs.getLong("job_id");
            m.put("jobId", rs.wasNull() ? null : jId);
            m.put("jobPostId", rs.wasNull() ? null : "JOB" + jId);
            long hId = rs.getLong("history_id");
            m.put("historyId", rs.wasNull() ? null : hId);
            m.put("candidateName", rs.getString("candidate_name"));
            m.put("jobTitle", rs.getString("job_title"));
            m.put("companyId", rs.getString("company_id"));
            return m;
        });

        return ResponseEntity.ok(rows);
    }

    // ═════════════════════════════════════════════════════════════
    private UUID resolveCompanyId(Jwt jwt) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        Company company = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return company.getCompanyId();
    }
}