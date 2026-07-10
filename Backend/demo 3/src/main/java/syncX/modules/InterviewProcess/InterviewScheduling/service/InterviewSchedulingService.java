package syncX.modules.InterviewProcess.InterviewScheduling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequest;
import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequestInterviewer;
import syncX.modules.InterviewProcess.InterviewRequest.repository.InterviewRequestRepository;
import syncX.modules.InterviewProcess.InterviewScheduling.dto.InterviewSchedulingDTO;
import syncX.modules.InterviewProcess.InterviewScheduling.entity.InterviewScheduled;
import syncX.modules.InterviewProcess.InterviewScheduling.repository.InterviewScheduledRepository;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.entity.Interviewer;
import syncX.modules.auth.repository.CompanyRepository;
import syncX.modules.auth.repository.InterviewerRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewSchedulingService {

    @Autowired private InterviewScheduledRepository scheduledRepo;
    @Autowired private InterviewRequestRepository   requestRepo;
    @Autowired private CompanyRepository            companyRepo;
    @Autowired private InterviewerRepository        interviewerRepo;


    // POST: finalize panel → create interview_scheduled row

    @Transactional
    public InterviewSchedulingDTO.ScheduledResponse finalizePanel(
            Jwt jwt, InterviewSchedulingDTO.FinalizeRequest req) {

        UUID adminUserId = UUID.fromString(jwt.getSubject());
        UUID companyId   = resolveCompanyId(jwt);

        // Fetch with interviewers eagerly to avoid LazyInitializationException
        InterviewRequest ir = requestRepo.findByIdWithInterviewers(req.getRequestId())
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        // Ownership check
        if (!ir.getCompanyId().equals(companyId))
            throw new SecurityException("You do not own this interview request");

        // State guard
        if (!"pending".equalsIgnoreCase(ir.getStatus()))
            throw new IllegalStateException(
                    "Cannot finalize a request with status: " + ir.getStatus());

        // Accepted count check
        long acceptedCount = ir.getInterviewers().stream()
                .filter(i -> "accepted".equalsIgnoreCase(i.getResponseStatus()))
                .count();
        if (acceptedCount < ir.getPanelSize())
            throw new IllegalStateException(
                    "Need at least " + ir.getPanelSize() + " accepted interviewers, " +
                            "currently have " + acceptedCount);

        // Resolve the physical-interview location: prefer an edited value sent from the
        // finalize popup, otherwise inherit the one already stored on the interview request.
        String effectiveLocation =
                (req.getInterviewLocation() != null && !req.getInterviewLocation().isBlank())
                        ? req.getInterviewLocation()
                        : ir.getInterviewLocation();

        // Online requires meeting link; Physical requires location
        if ("Online".equalsIgnoreCase(ir.getMode()) &&
                (req.getMeetingLink() == null || req.getMeetingLink().isBlank()))
            throw new IllegalArgumentException("Meeting link is required for Online interviews");
        if ("Physical".equalsIgnoreCase(ir.getMode()) &&
                (effectiveLocation == null || effectiveLocation.isBlank()))
            throw new IllegalArgumentException("Location is required for Physical interviews");

        // Idempotency — don't create duplicate
        if (scheduledRepo.existsByRequestId(ir.getRequestId()))
            throw new IllegalStateException("This panel has already been finalized");

        // Create the scheduled record
        InterviewScheduled scheduled = new InterviewScheduled();
        scheduled.setRequestId(ir.getRequestId());
        scheduled.setInterviewId(ir.getInterviewId());
        scheduled.setCompanyId(ir.getCompanyId());
        scheduled.setCandidateId(ir.getCandidateId());
        scheduled.setJobApplicationId(ir.getJobApplicationId());
        scheduled.setJobId(ir.getJobId());
        scheduled.setHistoryId(ir.getHistoryId());
        scheduled.setPanelSize(ir.getPanelSize());
        scheduled.setInterviewDate(ir.getInterviewDate());
        scheduled.setInterviewTime(ir.getInterviewTime());
        scheduled.setMode(ir.getMode());
        scheduled.setAdminNotes(ir.getAdminNotes());
        scheduled.setMeetingLink(
                "Online".equalsIgnoreCase(ir.getMode()) ? req.getMeetingLink() : null);
        scheduled.setInterviewLocation(
                "Physical".equalsIgnoreCase(ir.getMode()) ? effectiveLocation : null);
        scheduled.setScorecardId(null);
        scheduled.setStatus("scheduled");
        scheduled.setFinalizedBy(adminUserId);

        InterviewScheduled saved = scheduledRepo.save(scheduled);

        // Reject all still-pending interviewers
        for (InterviewRequestInterviewer iri : ir.getInterviewers()) {
            if ("pending".equalsIgnoreCase(iri.getResponseStatus())) {
                iri.setResponseStatus("rejected");
                iri.setRespondedAt(java.time.OffsetDateTime.now());
            }
        }

        // Mark the request as finalised
        ir.setStatus("finalized");
        requestRepo.save(ir);

        return buildResponse(saved, ir);
    }


    // GET: fetch the scheduled record for a given requestId
    @Transactional(readOnly = true)
    public InterviewSchedulingDTO.ScheduledResponse getByRequestId(Jwt jwt, UUID requestId) {

        UUID companyId = resolveCompanyId(jwt);

        InterviewScheduled scheduled = scheduledRepo.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("No schedule found for this request"));

        if (!scheduled.getCompanyId().equals(companyId))
            throw new SecurityException("You do not own this scheduled interview");

        // Fetch with interviewers eagerly to avoid LazyInitializationException
        InterviewRequest ir = requestRepo.findByIdWithInterviewers(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        return buildResponse(scheduled, ir);
    }



    @Transactional
    public InterviewSchedulingDTO.ScheduledResponse saveScorecard(
            Jwt jwt, UUID requestId, InterviewSchedulingDTO.SaveScorecardRequest req) {

        UUID companyId = resolveCompanyId(jwt);

        InterviewScheduled scheduled = scheduledRepo.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("No schedule found for this request"));

        if (!scheduled.getCompanyId().equals(companyId))
            throw new SecurityException("You do not own this scheduled interview");

        if (req.getScorecardId() == null)
            throw new IllegalArgumentException("Scorecard ID cannot be null");

        scheduled.setScorecardId(req.getScorecardId());
        scheduledRepo.save(scheduled);

        // Fetch with interviewers eagerly to avoid LazyInitializationException
        InterviewRequest ir = requestRepo.findByIdWithInterviewers(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        return buildResponse(scheduled, ir);
    }


    // PRIVATE helpers
    private InterviewSchedulingDTO.ScheduledResponse buildResponse(
            InterviewScheduled s, InterviewRequest ir) {

        List<InterviewSchedulingDTO.AcceptedInterviewer> accepted = ir.getInterviewers()
                .stream()
                .filter(iri -> "accepted".equalsIgnoreCase(iri.getResponseStatus()))
                .map(iri -> {
                    Interviewer iv = interviewerRepo
                            .findByUserId(iri.getInterviewerUserId()).orElse(null);
                    String name = iv != null ? iv.getFullName()        : "Unknown";
                    String role = iv != null ? iv.getInterviewerRole() : "";
                    return new InterviewSchedulingDTO.AcceptedInterviewer(
                            iri.getInterviewerUserId().toString(), name, role);
                })
                .collect(Collectors.toList());

        return new InterviewSchedulingDTO.ScheduledResponse(
                s.getScheduledId().toString(),
                s.getRequestId().toString(),
                s.getInterviewId(),
                s.getStatus(),
                s.getPanelSize(),
                s.getInterviewDate() != null ? s.getInterviewDate().toString() : "",
                safeTime(s.getInterviewTime()),
                s.getMode(),
                s.getAdminNotes(),
                s.getMeetingLink(),
                s.getInterviewLocation(),
                s.getScorecardId(),
                s.getFinalizedAt() != null ? s.getFinalizedAt().toString() : null,
                accepted);
    }

    private String safeTime(java.time.LocalTime t) {
        if (t == null) return "";
        String s = t.toString();
        return s.length() >= 5 ? s.substring(0, 5) : s;
    }

    private UUID resolveCompanyId(Jwt jwt) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        Company company  = companyRepo.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return company.getCompanyId();
    }
}