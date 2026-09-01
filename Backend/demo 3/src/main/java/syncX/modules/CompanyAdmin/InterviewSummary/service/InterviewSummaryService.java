package syncX.modules.CompanyAdmin.InterviewSummary.service;

import syncX.modules.CompanyAdmin.InterviewSummary.dto.InterviewSummaryRowDTO;
import syncX.modules.CompanyAdmin.InterviewSummary.dto.InterviewSummaryRowDTO.InterviewerScoreDTO;
import syncX.modules.CompanyAdmin.InterviewSummary.repository.InterviewSummaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewSummaryService {

    private final InterviewSummaryRepository repo;

    public InterviewSummaryService(InterviewSummaryRepository repo) {
        this.repo = repo;
    }


    public List<InterviewSummaryRowDTO> getInterviewList(UUID companyId) {

        List<Map<String, Object>> rows = repo.fetchCompletedInterviews(companyId);

        return rows.stream().map(row -> {
            UUID scheduledId = UUID.fromString(row.get("scheduled_id").toString());
            int totalRounds  = toInt(row.get("interview_rounds"), 1);
            // Round shown per interview row = the round THIS interview belonged
            // to (from the query), not the application's latest round. This is
            // why round 1's interview shows 1/2 and round 2's shows 2/2.
            int currentRound = toInt(row.get("round_number"), 1);
            String status    = (String) row.get("scheduled_status");

            // Fetch interviewer scores for this interview
            List<Map<String, Object>> scoreRows = repo.fetchInterviewerScores(scheduledId);

            List<InterviewerScoreDTO> scores = scoreRows.stream()
                    .map(sr -> {
                        boolean submitted = Boolean.TRUE.equals(sr.get("is_submitted"));
                        return InterviewerScoreDTO.builder()
                                .interviewerName((String) sr.get("interviewer_name"))
                                .submitted(submitted)
                                .totalScore(submitted ? toIntNullable(sr.get("total_score")) : null)
                                .maxPossibleScore(submitted ? toIntNullable(sr.get("max_possible_score")) : null)
                                .build();
                    })
                    .collect(Collectors.toList());

            // Map scheduled_status to a decision status
            String decisionStatus = null;
            if ("pass_completed".equalsIgnoreCase(status)) decisionStatus = "PASS";
            else if ("fail_completed".equalsIgnoreCase(status)) decisionStatus = "FAIL";

            return InterviewSummaryRowDTO.builder()
                    .scheduledId(scheduledId.toString())
                    .interviewId((String) row.get("interview_id"))
                    .candidateName((String) row.get("candidate_name"))
                    .jobTitle((String) row.get("job_title"))
                    .interviewDate(toLocalDate(row.get("interview_date")))
                    .interviewTime(toLocalTime(row.get("interview_time")))
                    .currentRound(currentRound)
                    .totalRounds(totalRounds)
                    .currentStatus(decisionStatus)
                    .interviewerScores(scores)
                    .build();
        }).collect(Collectors.toList());
    }


    @Transactional
    public String applyDecision(UUID scheduledId, UUID companyId, String decision) {

        if (!repo.verifyCompanyOwns(scheduledId, companyId)) {
            throw new RuntimeException("Access denied.");
        }

        if (!decision.equals("PASS") && !decision.equals("FAIL")) {
            throw new RuntimeException("Decision must be PASS or FAIL.");
        }

        Map<String, Object> meta = repo.fetchInterviewMeta(scheduledId);

        UUID candidateId     = UUID.fromString(meta.get("candidate_id").toString());
        UUID metaCompanyId   = UUID.fromString(meta.get("company_id").toString());
        long jobApplicationId = toLong(meta.get("job_application_id"));
        Long jobId            = toLongNullable(meta.get("job_id"));
        int  totalRounds      = toInt(meta.get("interview_rounds"), 1);
        int  currentRound     = repo.fetchCurrentRound(jobApplicationId);

        if (decision.equals("PASS")) {
            repo.applyPass(candidateId, metaCompanyId,
                    jobApplicationId, jobId,
                    currentRound, totalRounds);
            repo.updateScheduledStatus(scheduledId, "pass_completed");

            if (currentRound < totalRounds) {
                return "Candidate shortlisted for Round " + (currentRound + 1);
            } else {
                return "Candidate selected — all rounds complete";
            }

        } else {
            repo.applyFail(candidateId, metaCompanyId,
                    jobApplicationId, jobId, currentRound);
            repo.updateScheduledStatus(scheduledId, "fail_completed");
            return "Candidate marked as rejected";
        }
    }


    private int toInt(Object v, int fallback) {
        if (v == null) return fallback;
        if (v instanceof Number n) return n.intValue();
        try { return Integer.parseInt(v.toString()); } catch (Exception e) { return fallback; }
    }

    private Integer toIntNullable(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.intValue();
        try { return Integer.parseInt(v.toString()); } catch (Exception e) { return null; }
    }

    private long toLong(Object v) {
        if (v instanceof Number n) return n.longValue();
        return Long.parseLong(v.toString());
    }

    private Long toLongNullable(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString()); } catch (Exception e) { return null; }
    }

    private LocalDate toLocalDate(Object v) {
        if (v == null) return null;
        if (v instanceof LocalDate d) return d;
        if (v instanceof java.sql.Date d) return d.toLocalDate();
        return LocalDate.parse(v.toString().substring(0, 10));
    }

    private LocalTime toLocalTime(Object v) {
        if (v == null) return null;
        if (v instanceof LocalTime t) return t;
        if (v instanceof java.sql.Time t) return t.toLocalTime();
        return LocalTime.parse(v.toString().substring(0, 8));
    }
}