package syncX.modules.CompanyAdmin.Shortlisting.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import syncX.modules.CompanyAdmin.Shortlisting.dto.*;
import syncX.modules.CompanyAdmin.Shortlisting.service.ShortlistService;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.repository.CompanyRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Unified controller for the Shortlisting feature.
 *
 * Hosts two URL trees so the React frontend keeps working unchanged:
 *
 *   /api/company/shortlist/...                — write + DTO-based reads
 *      POST   /                               (shortlist a candidate)
 *      POST   /reject                         (reject a candidate)
 *      GET    /me                             (all my shortlists, grouped by job)
 *      GET    /me/job/{jobId}
 *      GET    /company/{companyId}            (legacy path; JWT-validated)
 *      GET    /company/{companyId}/job/{jobId}
 *
 *   /api/company/shortlisted-candidates/...   — page-level reads (frontend-shaped maps)
 *      GET    /jobs                           (jobs that have ≥1 active shortlist)
 *      GET    /?jobId=27                      (active shortlists, optionally filtered)
 *
 * The page-level reads stay raw-SQL because the React popups expect a
 * specific flat shape ({ candidateId, jobApplicationId, jobId, historyId,
 * candidateName, jobTitle, jobPostId, companyId }) that doesn't map
 * cleanly onto our JPA entities.
 *
 * All endpoints resolve company_id from the JWT, so a tenant can never
 * see another tenant's data — even on the legacy path-based endpoints.
 */
@RestController
public class ShortlistController {

    private final ShortlistService shortlistService;

    @Autowired private CompanyRepository companyRepository;
    @Autowired private JdbcTemplate jdbc;

    public ShortlistController(ShortlistService shortlistService) {
        this.shortlistService = shortlistService;
    }

    // ═════════════════════════════════════════════════════════════
    // Writes — POST /api/company/shortlist[...]
    // ═════════════════════════════════════════════════════════════

    @PostMapping("/api/company/shortlist")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<ShortlistResponseDTO> shortlistCandidate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ShortlistRequestDTO request) {
        // Force company_id from the JWT — never trust the body for tenancy.
        request.setCompanyId(resolveCompanyId(jwt));
        return ResponseEntity.ok(shortlistService.shortlistCandidate(request));
    }

    @PostMapping("/api/company/shortlist/reject")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<ShortlistResponseDTO> rejectCandidate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ShortlistRequestDTO request) {
        request.setCompanyId(resolveCompanyId(jwt));
        request.setManualDecision("Reject");
        return ResponseEntity.ok(shortlistService.rejectCandidate(request));
    }

    // ═════════════════════════════════════════════════════════════
    // DTO-based reads — JWT-resolved (preferred)
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

    // ─────────────────────────────────────────────────────────────
    // DTO-based reads — legacy path-based (kept for backwards compatibility)
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/api/company/shortlist/company/{companyId}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<ShortlistedByJobDTO>> getByCompany(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID companyId) {
        UUID my = resolveCompanyId(jwt);
        if (!my.equals(companyId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(shortlistService.getShortlistedByCompany(companyId));
    }

    @GetMapping("/api/company/shortlist/company/{companyId}/job/{jobId}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<ShortlistResponseDTO>> getByJob(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID companyId,
            @PathVariable Long jobId) {
        UUID my = resolveCompanyId(jwt);
        if (!my.equals(companyId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(shortlistService.getShortlistedByJob(companyId, jobId));
    }

    // ═════════════════════════════════════════════════════════════
    // Page-level reads — GET /api/company/shortlisted-candidates[...]
    // These power the React "Shortlisted Candidates" page directly.
    // ═════════════════════════════════════════════════════════════

    /**
     * GET /api/company/shortlisted-candidates/jobs
     *
     * Jobs that currently have at least one active (non-rejected)
     * shortlisted candidate for this company. Used by the job picker.
     */
    @GetMapping("/api/company/shortlisted-candidates/jobs")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<Map<String, Object>>> listJobsWithShortlisted(
            @AuthenticationPrincipal Jwt jwt) {

        UUID companyId = resolveCompanyId(jwt);

        // Only count rows that are still considered active shortlists.
        // (ShortlistService.rejectCandidate() also writes REJECTED rows
        //  to this table — those should NOT make a job appear in the picker.)
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
            m.put("jobId",     jId);
            m.put("jobTitle",  rs.getString("job_title"));
            m.put("jobPostId", "JOB" + jId);
            return m;
        });

        return ResponseEntity.ok(rows);
    }

    /**
     * GET /api/company/shortlisted-candidates?jobId=27
     *
     * Active shortlisted candidates for this company, optionally filtered
     * by job. Returns the flat shape the React popups expect.
     */
    @GetMapping("/api/company/shortlisted-candidates")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<Map<String, Object>>> listShortlisted(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long jobId) {

        UUID companyId = resolveCompanyId(jwt);

        StringBuilder sql = new StringBuilder()
                .append("SELECT ")
                .append("  sc.candidate_id          AS candidate_id, ")
                .append("  sc.job_application_id    AS job_application_id, ")
                .append("  ja.job_id                AS job_id, ")
                .append("  sc.history_id            AS history_id, ")
                .append("  c.first_name || ' ' || c.last_name AS candidate_name, ")
                .append("  COALESCE(j.job_title, ja.job_title) AS job_title, ")
                .append("  sc.company_id            AS company_id ")
                .append("FROM public.shortlisted_candidates sc ")
                .append("JOIN public.candidates       c  ON c.candidate_id = sc.candidate_id ")
                .append("JOIN public.job_applications ja ON ja.id          = sc.job_application_id ")
                .append("LEFT JOIN public.jobs        j  ON j.id           = ja.job_id ")
                .append("WHERE sc.company_id = ? ")
                // Hide rejected rows — the page is for *active* shortlists only.
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

            m.put("candidateId",      rs.getString("candidate_id"));
            m.put("jobApplicationId", rs.getLong("job_application_id"));

            long jId = rs.getLong("job_id");
            m.put("jobId",     rs.wasNull() ? null : jId);
            m.put("jobPostId", rs.wasNull() ? null : "JOB" + jId);

            long hId = rs.getLong("history_id");
            m.put("historyId", rs.wasNull() ? null : hId);

            m.put("candidateName", rs.getString("candidate_name"));
            m.put("jobTitle",      rs.getString("job_title"));
            m.put("companyId",     rs.getString("company_id"));
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