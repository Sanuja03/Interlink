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
    // Page-level reads — FAST single-query endpoints
    // ═════════════════════════════════════════════════════════════

    /**
     * Returns the list of jobs that have shortlisted candidates.
     * Only jobs/rounds where no finalized interview exists yet are shown
     * as "actionable" — but we return all for the dropdown.
     */
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

    /**
     * Returns shortlisted candidates for the page table.
     *
     * KEY FIXES vs old version:
     * 1. Uses a single SQL query with subqueries — no N+1 per-candidate status checks.
     * 2. Deduplicates: if a candidate has multiple shortlisted_candidates rows for the
     *    same job_application_id (e.g. round 1 + round 2), only the LATEST one is shown.
     * 3. Computes the correct round number from candidate_history_stages.
     * 4. Returns isFinalized flag directly from interview_scheduled table so the
     *    frontend doesn't need to make N extra API calls.
     * 5. Returns the history_id from candidate_history_stages (the stage that corresponds
     *    to the current round), not just the bare shortlisted_candidates.history_id.
     */
    @GetMapping("/api/company/shortlisted-candidates")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<Map<String, Object>>> listShortlisted(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long jobId) {

        UUID companyId = resolveCompanyId(jwt);

        // ── Single efficient query ──────────────────────────────────────────
        // CTE latest_sc: picks only the most-recent shortlisted_candidates row
        //   per (candidate_id, job_application_id, company_id) so duplicates from
        //   round-progression inserts don't appear twice.
        //
        // CTE round_info: gets the current round number and history stage id
        //   from candidate_history_stages.
        //
        // Main: joins everything together and checks for a finalized interview
        //   in interview_scheduled in a single LEFT JOIN subquery.
        // ───────────────────────────────────────────────────────────────────

        String sql =
                "WITH latest_sc AS ( " +
                        "  SELECT DISTINCT ON (sc.candidate_id, sc.job_application_id) " +
                        "         sc.id, sc.candidate_id, sc.company_id, sc.job_application_id, " +
                        "         sc.history_id, sc.status, sc.shortlisted_at " +
                        "  FROM   public.shortlisted_candidates sc " +
                        "  WHERE  sc.company_id = ? " +
                        "    AND  UPPER(COALESCE(sc.status,'SHORTLISTED')) = 'SHORTLISTED' " +
                        "  ORDER BY sc.candidate_id, sc.job_application_id, sc.id DESC " +
                        "), " +
                        "round_info AS ( " +
                        "  SELECT  chs.job_application_id, " +
                        "          chs.id      AS history_stage_id, " +
                        "          COALESCE( " +
                        "            CAST( NULLIF(REGEXP_REPLACE(chs.stage,'[^0-9]','','g'), '') AS INTEGER ), " +
                        "            1 " +
                        "          ) AS round_number " +
                        "  FROM   public.candidate_history_stages chs " +
                        "  INNER JOIN ( " +
                        "    SELECT job_application_id, MAX(id) AS max_id " +
                        "    FROM   public.candidate_history_stages " +
                        "    WHERE  stage ILIKE 'ROUND%' OR stage ILIKE 'SHORTLISTED' " +
                        "    GROUP BY job_application_id " +
                        "  ) latest ON chs.id = latest.max_id " +
                        ") " +
                        "SELECT " +
                        "  lsc.candidate_id, " +
                        "  lsc.job_application_id, " +
                        "  ja.job_id, " +
                        "  COALESCE(ri.history_stage_id, lsc.history_id) AS history_id, " +
                        "  COALESCE(ri.round_number, 1)                  AS round_number, " +
                        "  c.first_name || ' ' || c.last_name             AS candidate_name, " +
                        "  COALESCE(j.job_title, ja.job_title)            AS job_title, " +
                        "  lsc.company_id, " +
                        "  CASE WHEN fin.scheduled_id IS NOT NULL THEN fin.request_id::text " +
                        "       ELSE NULL END                             AS finalized_request_id, " +
                        "  fin.scheduled_id::text                         AS finalized_scheduled_id " +
                        "FROM latest_sc lsc " +
                        "JOIN public.candidates        c   ON c.candidate_id = lsc.candidate_id " +
                        "JOIN public.job_applications  ja  ON ja.id          = lsc.job_application_id " +
                        "LEFT JOIN public.jobs         j   ON j.id           = ja.job_id " +
                        "LEFT JOIN round_info          ri  ON ri.job_application_id = lsc.job_application_id " +
                        "LEFT JOIN ( " +
                        "  SELECT DISTINCT ON (ir.job_application_id) " +
                        "         isc.scheduled_id, ir.request_id, ir.job_application_id " +
                        "  FROM   public.interview_scheduled isc " +
                        "  JOIN   public.interview_requests  ir ON ir.request_id = isc.request_id " +
                        "  WHERE  isc.status NOT IN ('cancelled') " +
                        "  ORDER BY ir.job_application_id, isc.finalized_at DESC " +
                        ") fin ON fin.job_application_id = lsc.job_application_id ";

        Object[] args;
        if (jobId != null) {
            sql += "WHERE ja.job_id = ? ";
            args = new Object[]{ companyId, jobId };
        } else {
            args = new Object[]{ companyId };
        }
        sql += "ORDER BY lsc.shortlisted_at DESC";

        List<Map<String, Object>> rows = jdbc.query(sql, args, (rs, rowNum) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("candidateId", rs.getString("candidate_id"));
            m.put("jobApplicationId", rs.getLong("job_application_id"));
            long jId = rs.getLong("job_id");
            m.put("jobId", rs.wasNull() ? null : jId);
            m.put("jobPostId", rs.wasNull() ? null : "JOB" + jId);
            long hId = rs.getLong("history_id");
            m.put("historyId", rs.wasNull() ? null : hId);
            m.put("round", rs.getInt("round_number"));
            m.put("candidateName", rs.getString("candidate_name"));
            m.put("jobTitle", rs.getString("job_title"));
            m.put("companyId", rs.getString("company_id"));
            // Finalized flag — frontend can read this directly instead of making extra API calls
            String finalizedRequestId = rs.getString("finalized_request_id");
            m.put("finalizedRequestId", finalizedRequestId);
            m.put("isFinalized", finalizedRequestId != null);
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

    @GetMapping("/api/company/shortlisted-candidates/jobs-debug")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> jobsDebug(@AuthenticationPrincipal Jwt jwt) {
        try {
            UUID companyId = resolveCompanyId(jwt);
            String sql =
                    "SELECT DISTINCT j.id AS job_id, j.job_title AS job_title " +
                            "FROM public.shortlisted_candidates sc " +
                            "JOIN public.job_applications ja ON ja.id = sc.job_application_id " +
                            "JOIN public.jobs j              ON j.id  = ja.job_id " +
                            "WHERE sc.company_id = ? " +
                            "  AND UPPER(COALESCE(sc.status, 'SHORTLISTED')) = 'SHORTLISTED' " +
                            "ORDER BY j.id DESC";

            List<Map<String, Object>> rows = jdbc.queryForList(sql, companyId);
            return ResponseEntity.ok(Map.of("success", true, "count", rows.size(), "rows", rows));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "errorClass", e.getClass().getSimpleName(),
                    "errorMessage", e.getMessage(),
                    "rootCause", e.getCause() != null ? e.getCause().getMessage() : "none"
            ));
        }
    }
}