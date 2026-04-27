//package syncX.modules.ShortlistedCandidates.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.jdbc.core.JdbcTemplate;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.oauth2.jwt.Jwt;
//import org.springframework.web.bind.annotation.*;
//
//import syncX.modules.auth.entity.Company;
//import syncX.modules.auth.repository.CompanyRepository;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//
///**
// * Endpoints for the Shortlisted Candidates page.
// *
// *  GET /api/company/shortlisted-candidates/jobs
// *      → list of jobs that this company has at least one shortlisted
// *        candidate for. Used to populate the job picker.
// *
// *  GET /api/company/shortlisted-candidates?jobId=27
// *      → list of shortlisted candidates for the given job (or all jobs
// *        belonging to this company if jobId is omitted).
// *
// * Every row returned has the exact shape the React popups expect:
// *   { candidateId, jobApplicationId, jobId, historyId,
// *     candidateName, jobTitle, jobPostId, companyId }
// *
// * The company id is resolved from the JWT, so an admin can never see
// * another company's candidates.
// *
// * NOTE: This controller is the read-side façade for the page. It keeps
// * the legacy URL contract the React frontend was built against, but its
// * SQL now reads from the same `shortlisted_candidates` table that the
// * new CompanyAdmin/Shortlisting module writes into via
// * {@code POST /api/company/shortlist} and
// * {@code POST /api/company/shortlist/reject}. The two systems are
// * already pointed at the same table, so no data migration is needed —
// * we just keep this read endpoint stable for the frontend.
// */
//@RestController
//@RequestMapping("/api/company/shortlisted-candidates")
//public class ShortlistedCandidatesController {
//
//    @Autowired private CompanyRepository companyRepository;
//    @Autowired private JdbcTemplate jdbc;
//
//    // ─────────────────────────────────────────────────────────────
//    // GET /api/company/shortlisted-candidates/jobs
//    // ─────────────────────────────────────────────────────────────
//    @GetMapping("/jobs")
//    @PreAuthorize("hasRole('company_admin')")
//    public ResponseEntity<List<Map<String, Object>>> listJobsWithShortlisted(
//            @AuthenticationPrincipal Jwt jwt) {
//
//        UUID companyId = resolveCompanyId(jwt);
//
//        // Only count rows that are still considered active shortlists
//        // (the new ShortlistService also writes REJECTED rows to this
//        // table — those should NOT make a job appear in the picker).
//        String sql =
//                "SELECT DISTINCT j.id AS job_id, j.job_title AS job_title " +
//                        "FROM public.shortlisted_candidates sc " +
//                        "JOIN public.job_applications ja ON ja.id = sc.job_application_id " +
//                        "JOIN public.jobs j              ON j.id  = ja.job_id " +
//                        "WHERE sc.company_id = ? " +
//                        "  AND UPPER(COALESCE(sc.status, 'SHORTLISTED')) = 'SHORTLISTED' " +
//                        "ORDER BY j.id DESC";
//
//        List<Map<String, Object>> rows = jdbc.query(sql, new Object[]{ companyId }, (rs, rowNum) -> {
//            Map<String, Object> m = new HashMap<>();
//            long jId = rs.getLong("job_id");
//            m.put("jobId",     jId);
//            m.put("jobTitle",  rs.getString("job_title"));
//            m.put("jobPostId", "JOB" + jId);
//            return m;
//        });
//
//        return ResponseEntity.ok(rows);
//    }
//
//    // ─────────────────────────────────────────────────────────────
//    // GET /api/company/shortlisted-candidates?jobId=27
//    // ─────────────────────────────────────────────────────────────
//    @GetMapping
//    @PreAuthorize("hasRole('company_admin')")
//    public ResponseEntity<List<Map<String, Object>>> listShortlisted(
//            @AuthenticationPrincipal Jwt jwt,
//            @RequestParam(required = false) Long jobId) {
//
//        UUID companyId = resolveCompanyId(jwt);
//
//        StringBuilder sql = new StringBuilder()
//                .append("SELECT ")
//                .append("  sc.candidate_id          AS candidate_id, ")
//                .append("  sc.job_application_id    AS job_application_id, ")
//                .append("  ja.job_id                AS job_id, ")
//                .append("  sc.history_id            AS history_id, ")
//                .append("  c.first_name || ' ' || c.last_name AS candidate_name, ")
//                .append("  COALESCE(j.job_title, ja.job_title) AS job_title, ")
//                .append("  sc.company_id            AS company_id ")
//                .append("FROM public.shortlisted_candidates sc ")
//                .append("JOIN public.candidates       c  ON c.candidate_id = sc.candidate_id ")
//                .append("JOIN public.job_applications ja ON ja.id          = sc.job_application_id ")
//                .append("LEFT JOIN public.jobs        j  ON j.id           = ja.job_id ")
//                .append("WHERE sc.company_id = ? ")
//                // Hide rejected rows — the new service writes REJECTED rows
//                // to this table, but the page is for *active* shortlists only.
//                .append("  AND UPPER(COALESCE(sc.status, 'SHORTLISTED')) = 'SHORTLISTED' ");
//
//        Object[] args;
//        if (jobId != null) {
//            sql.append("AND ja.job_id = ? ");
//            args = new Object[]{ companyId, jobId };
//        } else {
//            args = new Object[]{ companyId };
//        }
//        sql.append("ORDER BY sc.shortlisted_at DESC");
//
//        List<Map<String, Object>> rows = jdbc.query(sql.toString(), args, (rs, rowNum) -> {
//            Map<String, Object> m = new HashMap<>();
//
//            m.put("candidateId",      rs.getString("candidate_id"));
//            m.put("jobApplicationId", rs.getLong("job_application_id"));
//
//            long jId = rs.getLong("job_id");
//            m.put("jobId",     rs.wasNull() ? null : jId);
//            m.put("jobPostId", rs.wasNull() ? null : "JOB" + jId);
//
//            long hId = rs.getLong("history_id");
//            m.put("historyId", rs.wasNull() ? null : hId);
//
//            m.put("candidateName", rs.getString("candidate_name"));
//            m.put("jobTitle",      rs.getString("job_title"));
//            m.put("companyId",     rs.getString("company_id"));
//            return m;
//        });
//
//        return ResponseEntity.ok(rows);
//    }
//
//    // ─────────────────────────────────────────────────────────────
//    private UUID resolveCompanyId(Jwt jwt) {
//        UUID adminUserId = UUID.fromString(jwt.getSubject());
//        Company company = companyRepository.findByUserId(adminUserId)
//                .orElseThrow(() -> new RuntimeException("Company not found"));
//        return company.getCompanyId();
//    }
//}