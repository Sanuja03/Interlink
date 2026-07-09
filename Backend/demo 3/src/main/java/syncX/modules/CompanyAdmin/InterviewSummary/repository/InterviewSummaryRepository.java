package syncX.modules.CompanyAdmin.InterviewSummary.repository;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public class InterviewSummaryRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public InterviewSummaryRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ── Fetch all completed interviews for a company ─────────────────────────
    // Shows ALL interviews regardless of whether all scorecards submitted
    public List<Map<String, Object>> fetchCompletedInterviews(UUID companyId) {
        String sql = """
            SELECT
                isc.scheduled_id,
                isc.interview_id,
                isc.interview_date,
                isc.interview_time,
                isc.status          AS scheduled_status,
                isc.job_application_id,
                isc.job_id,

                c.first_name || ' ' || c.last_name AS candidate_name,
                c.candidate_id,

                COALESCE(j.job_title, j.title) AS job_title,
                j.interview_rounds,

                isc.company_id

            FROM interview_scheduled isc
            JOIN interview_requests  ir  ON ir.request_id  = isc.request_id
            JOIN candidates          c   ON c.candidate_id = ir.candidate_id
            JOIN jobs                j   ON j.id           = isc.job_id

            WHERE isc.company_id = :companyId
              AND isc.status NOT IN ('cancelled')

            ORDER BY isc.interview_date DESC, isc.interview_time DESC
        """;
        return jdbc.queryForList(sql,
                new MapSqlParameterSource("companyId", companyId));
    }

    // ── Fetch interviewer scores for a scheduled interview ───────────────────
    // Returns one row per assigned interviewer; score is null if not submitted
    public List<Map<String, Object>> fetchInterviewerScores(UUID scheduledId) {
        String sql = """
            SELECT
                COALESCE(i.full_name, u.email)  AS interviewer_name,
                iss.is_submitted,
                SUM(isfv.score_given)            AS total_score,
                SUM(stf.max_score)               AS max_possible_score

            FROM interview_request_interviewers iri
            JOIN interview_scheduled  isc ON isc.request_id        = iri.request_id
            JOIN users                u   ON u.user_id             = iri.interviewer_user_id
            LEFT JOIN interviewers    i   ON i.user_id             = iri.interviewer_user_id
            LEFT JOIN interviewer_score_submissions iss
                ON  iss.scheduled_id        = isc.scheduled_id
                AND iss.interviewer_user_id = iri.interviewer_user_id
                AND iss.is_submitted        = true
            LEFT JOIN interviewer_score_field_values isfv
                ON  isfv.score_submission_id = iss.score_submission_id
            LEFT JOIN scorecard_template_fields stf
                ON  stf.scorecard_field_id   = isfv.scorecard_field_id

            WHERE isc.scheduled_id = :scheduledId

            GROUP BY
                COALESCE(i.full_name, u.email),
                iss.is_submitted

            ORDER BY COALESCE(i.full_name, u.email)
        """;
        return jdbc.queryForList(sql,
                new MapSqlParameterSource("scheduledId", scheduledId));
    }

    // ── Fetch current round from history ─────────────────────────────────────
    public int fetchCurrentRound(long jobApplicationId) {
        String sql = """
            SELECT COALESCE(MAX(
                CAST(REGEXP_REPLACE(stage, '[^0-9]', '', 'g') AS INTEGER)
            ), 1)
            FROM candidate_history_stages
            WHERE job_application_id = :jobApplicationId
              AND stage ILIKE 'ROUND%'
        """;
        Integer result = jdbc.queryForObject(sql,
                new MapSqlParameterSource("jobApplicationId", jobApplicationId),
                Integer.class);
        return result != null ? result : 1;
    }

    // ── Apply PASS decision ───────────────────────────────────────────────────
    public void applyPass(UUID candidateId, UUID companyId,
                          long jobApplicationId, Long jobId,
                          int currentRound, int totalRounds) {

        if (currentRound < totalRounds) {
            // More rounds remain — shortlist for next round
            int nextRound = currentRound + 1;

            // 1. Mark the current round stage as COMPLETED
            jdbc.update("""
                UPDATE candidate_history_stages
                   SET status = 'COMPLETED', stage_date = NOW()
                 WHERE job_application_id = :jobApplicationId
                   AND stage = :stage
                """,
                    new MapSqlParameterSource()
                            .addValue("jobApplicationId", jobApplicationId)
                            .addValue("stage", "ROUND_" + currentRound));

            // 2. Insert next round stage — use RETURNING id to get the generated key
            //    via NamedParameterJdbcTemplate + GeneratedKeyHolder
            org.springframework.jdbc.support.GeneratedKeyHolder holder =
                    new org.springframework.jdbc.support.GeneratedKeyHolder();
            jdbc.update("""
                INSERT INTO candidate_history_stages
                    (candidate_id, company_id, job_application_id, job_id,
                     stage, status, stage_date, created_at)
                VALUES
                    (:candidateId, :companyId, :jobApplicationId, :jobId,
                     :stage, 'NOT_COMPLETED', NOW(), NOW())
                """,
                    new MapSqlParameterSource()
                            .addValue("candidateId", candidateId)
                            .addValue("companyId", companyId)
                            .addValue("jobApplicationId", jobApplicationId)
                            .addValue("jobId", jobId)
                            .addValue("stage", "ROUND_" + nextRound),
                    holder,
                    new String[]{"id"});

            Long nextHistoryId = extractKey(holder);

            // 3. Insert shortlisted_candidates row for next round (with history_id)
            jdbc.update("""
                INSERT INTO shortlisted_candidates
                    (candidate_id, company_id, job_application_id, history_id,
                     final_status, status, ai_suggestion,
                     shortlisted_at, created_at, updated_at)
                VALUES
                    (:candidateId, :companyId, :jobApplicationId, :historyId,
                     :finalStatus, 'SHORTLISTED', :suggestion,
                     NOW(), NOW(), NOW())
                """,
                    new MapSqlParameterSource()
                            .addValue("candidateId", candidateId)
                            .addValue("companyId", companyId)
                            .addValue("jobApplicationId", jobApplicationId)
                            .addValue("historyId", nextHistoryId)
                            .addValue("finalStatus", "ROUND_" + nextRound + "_READY")
                            .addValue("suggestion",
                                    "Passed Round " + currentRound + ". Ready for Round " + nextRound + " scheduling."));

        } else {
            // Final round — mark as selected
            jdbc.update("""
                UPDATE job_applications
                   SET status = CAST('SHORTLISTED' AS application_status)
                 WHERE id = :id
                """,
                    new MapSqlParameterSource("id", jobApplicationId));

            // Mark last round stage COMPLETED
            jdbc.update("""
                UPDATE candidate_history_stages
                   SET status = 'COMPLETED', stage_date = NOW()
                 WHERE job_application_id = :jobApplicationId
                   AND stage = :stage
                """,
                    new MapSqlParameterSource()
                            .addValue("jobApplicationId", jobApplicationId)
                            .addValue("stage", "ROUND_" + currentRound));

            // Insert HIRED stage and capture its id
            org.springframework.jdbc.support.GeneratedKeyHolder hiredHolder =
                    new org.springframework.jdbc.support.GeneratedKeyHolder();
            jdbc.update("""
                INSERT INTO candidate_history_stages
                    (candidate_id, company_id, job_application_id, job_id,
                     stage, status, stage_date, created_at)
                VALUES
                    (:candidateId, :companyId, :jobApplicationId, :jobId,
                     'HIRED', 'COMPLETED', NOW(), NOW())
                """,
                    new MapSqlParameterSource()
                            .addValue("candidateId", candidateId)
                            .addValue("companyId", companyId)
                            .addValue("jobApplicationId", jobApplicationId)
                            .addValue("jobId", jobId),
                    hiredHolder,
                    new String[]{"id"});

            Long hiredHistoryId = extractKey(hiredHolder);

            jdbc.update("""
                INSERT INTO shortlisted_candidates
                    (candidate_id, company_id, job_application_id, history_id,
                     final_status, status, ai_suggestion,
                     shortlisted_at, created_at, updated_at)
                VALUES
                    (:candidateId, :companyId, :jobApplicationId, :historyId,
                     'SELECTED', 'SHORTLISTED', :suggestion,
                     NOW(), NOW(), NOW())
                """,
                    new MapSqlParameterSource()
                            .addValue("candidateId", candidateId)
                            .addValue("companyId", companyId)
                            .addValue("jobApplicationId", jobApplicationId)
                            .addValue("historyId", hiredHistoryId)
                            .addValue("suggestion",
                                    "All " + totalRounds + " rounds completed. Candidate selected."));
        }
    }

    // ── Helper: extract generated key from KeyHolder ──────────────────────────
    private Long extractKey(org.springframework.jdbc.support.GeneratedKeyHolder holder) {
        try {
            java.util.Map<String, Object> keys = holder.getKeys();
            if (keys != null && keys.containsKey("id")) {
                Object v = keys.get("id");
                if (v instanceof Number n) return n.longValue();
            }
        } catch (Exception ignored) {}
        return null;
    }

    // ── Apply FAIL decision ───────────────────────────────────────────────────
    public void applyFail(UUID candidateId, UUID companyId,
                          long jobApplicationId, Long jobId, int currentRound) {

        jdbc.update("""
            UPDATE job_applications
               SET status = CAST('REJECTED' AS application_status)
             WHERE id = :id
            """,
                new MapSqlParameterSource("id", jobApplicationId));

        jdbc.update("""
            INSERT INTO candidate_history_stages
                (candidate_id, company_id, job_application_id, job_id,
                 stage, status, stage_date)
            VALUES
                (:candidateId, :companyId, :jobApplicationId, :jobId,
                 'REJECTED', 'COMPLETED', NOW())
            """,
                new MapSqlParameterSource()
                        .addValue("candidateId", candidateId)
                        .addValue("companyId", companyId)
                        .addValue("jobApplicationId", jobApplicationId)
                        .addValue("jobId", jobId));
    }

    // ── Mark scheduled interview status ──────────────────────────────────────
    public void updateScheduledStatus(UUID scheduledId, String status) {
        jdbc.update("""
            UPDATE interview_scheduled
               SET status = :status, updated_at = NOW()
             WHERE scheduled_id = :scheduledId
            """,
                new MapSqlParameterSource()
                        .addValue("scheduledId", scheduledId)
                        .addValue("status", status));
    }

    // ── Fetch single row meta for decision processing ─────────────────────────
    public Map<String, Object> fetchInterviewMeta(UUID scheduledId) {
        String sql = """
            SELECT
                isc.scheduled_id,
                isc.job_application_id,
                isc.job_id,
                isc.company_id,
                ir.candidate_id,
                j.interview_rounds
            FROM interview_scheduled isc
            JOIN interview_requests  ir ON ir.request_id = isc.request_id
            JOIN jobs                j  ON j.id          = isc.job_id
            WHERE isc.scheduled_id = :scheduledId
        """;
        return jdbc.queryForMap(sql,
                new MapSqlParameterSource("scheduledId", scheduledId));
    }

    // ── Security check ────────────────────────────────────────────────────────
    public boolean verifyCompanyOwns(UUID scheduledId, UUID companyId) {
        String sql = """
            SELECT COUNT(1) > 0
            FROM interview_scheduled
            WHERE scheduled_id = :scheduledId AND company_id = :companyId
        """;
        return Boolean.TRUE.equals(jdbc.queryForObject(sql,
                new MapSqlParameterSource()
                        .addValue("scheduledId", scheduledId)
                        .addValue("companyId", companyId),
                Boolean.class));
    }
}