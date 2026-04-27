package syncX.modules.InterviewProcess.InterviewScheduling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequest;
import syncX.modules.InterviewProcess.InterviewRequest.repository.InterviewRequestRepository;
import syncX.modules.InterviewProcess.InterviewScheduling.dto.InterviewerDashboardDTO;
import syncX.modules.InterviewProcess.InterviewScheduling.entity.InterviewScheduled;
import syncX.modules.InterviewProcess.InterviewScheduling.repository.InterviewScheduledRepository;
import syncX.modules.auth.entity.Candidate;
import syncX.modules.auth.repository.CandidateRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class InterviewerDashboardService {

    @Autowired private InterviewScheduledRepository scheduledRepo;
    @Autowired private InterviewRequestRepository   requestRepo;
    @Autowired private CandidateRepository          candidateRepo;

    // Job title repo is optional — wire in your actual one if you have it.
    // If absent, jobTitle falls back to "—".
    @Autowired(required = false) private syncX.modules.CompanyAdmin.job.repository.JobRepository jobRepo;

    private static final DateTimeFormatter TABLE_TIME_FMT = DateTimeFormatter.ofPattern("h.mm a");
    private static final DateTimeFormatter CARD_TIME_FMT  = DateTimeFormatter.ofPattern("h:mm a");
    private static final DateTimeFormatter ISO_DATE_FMT   = DateTimeFormatter.ISO_LOCAL_DATE;

    // ════════════════════════════════════════════════════════════
    // PUBLIC: build the full dashboard payload
    // ════════════════════════════════════════════════════════════
    public InterviewerDashboardDTO.DashboardResponse getDashboard(Jwt jwt) {

        UUID interviewerUserId = UUID.fromString(jwt.getSubject());
        LocalDate today = LocalDate.now();
        LocalTime now   = LocalTime.now();

        // ── Stats ──
        long scheduled = scheduledRepo.countByInterviewerAndStatus(interviewerUserId, "scheduled");
        long completed = scheduledRepo.countByInterviewerAndStatus(interviewerUserId, "completed");
        long pending   = requestRepo.countPendingForInterviewer(interviewerUserId);

        InterviewerDashboardDTO.Stats stats =
                new InterviewerDashboardDTO.Stats(scheduled, pending, completed);

        // ── Today's schedule rows ──
        List<InterviewScheduled> todayRows =
                scheduledRepo.findTodayForInterviewer(interviewerUserId, today);

        List<InterviewerDashboardDTO.TodayRow> todaySchedule = new ArrayList<>();
        for (InterviewScheduled s : todayRows) {
            todaySchedule.add(new InterviewerDashboardDTO.TodayRow(
                    s.getInterviewId(),
                    candidateName(s.getCandidateId()),
                    jobTitle(s.getJobId()),
                    s.getInterviewTime().format(TABLE_TIME_FMT),
                    s.getMode(),
                    s.getRequestId().toString()
            ));
        }

        // ── Next upcoming interview (any future date) ──
        List<InterviewScheduled> upcoming =
                scheduledRepo.findUpcomingForInterviewer(interviewerUserId, today, now);

        InterviewerDashboardDTO.NextInterview next = null;
        if (!upcoming.isEmpty()) {
            next = buildNextInterview(upcoming.get(0));
        }

        return new InterviewerDashboardDTO.DashboardResponse(stats, todaySchedule, next);
    }

    // ════════════════════════════════════════════════════════════
    // PRIVATE helpers
    // ════════════════════════════════════════════════════════════

    private InterviewerDashboardDTO.NextInterview buildNextInterview(InterviewScheduled s) {

        InterviewRequest ir = requestRepo.findById(s.getRequestId()).orElse(null);

        // For Online: meeting link present → CONFIRMED, else PENDING
        // For Physical: always CONFIRMED (no link needed)
        String meetingStatus = "Online".equalsIgnoreCase(s.getMode())
                ? (s.getMeetingLink() != null && !s.getMeetingLink().isBlank()
                ? "CONFIRMED" : "PENDING")
                : "CONFIRMED";

        InterviewerDashboardDTO.Candidate candidate = buildCandidate(
                s.getCandidateId(),
                ir != null ? ir.getAdminNotes() : null
        );

        return new InterviewerDashboardDTO.NextInterview(
                s.getInterviewId(),
                s.getInterviewDate().format(ISO_DATE_FMT),
                s.getInterviewTime().format(CARD_TIME_FMT),
                jobTitle(s.getJobId()),
                s.getMeetingLink(),
                meetingStatus,
                s.getMode(),
                candidate
        );
    }

    /**
     * Build the candidate sub-block for the "Next Interview" card.
     * Only name comes from the Candidate entity. Image / CV / profile
     * link aren't stored on Candidate — left null so the frontend
     * falls back to the default avatar and hides missing pieces.
     */
    private InterviewerDashboardDTO.Candidate buildCandidate(UUID candidateId, String adminNote) {
        String name = candidateName(candidateId);

        return new InterviewerDashboardDTO.Candidate(
                null,                                          // image  — not stored yet
                candidateId != null ? candidateId.toString() : "",
                name,
                null,                                          // cvName — not stored yet
                null,                                          // profileLink — not stored yet
                adminNote                                      // note from admin on the request
        );
    }

    /** Combine firstName + lastName from the Candidate entity. */
    private String candidateName(UUID candidateId) {
        if (candidateId == null) return "Unknown";
        try {
            return candidateRepo.findById(candidateId)
                    .map(this::fullName)
                    .orElse("Unknown");
        } catch (Exception e) {
            return "Unknown";
        }
    }

    private String fullName(Candidate c) {
        String first = c.getFirstName() != null ? c.getFirstName().trim() : "";
        String last  = c.getLastName()  != null ? c.getLastName().trim()  : "";
        String full  = (first + " " + last).trim();
        return full.isEmpty() ? "Unknown" : full;
    }

    /** Best-effort job title lookup. Adjust getter name to your Job entity. */
    private String jobTitle(Long jobId) {
        if (jobRepo == null || jobId == null) return "—";
        try {
            return jobRepo.findById(jobId)
                    .map(j -> {
                        try { return j.getJobTitle(); }
                        catch (Exception e) { return "—"; }
                    })
                    .orElse("—");
        } catch (Exception e) {
            return "—";
        }
    }
}