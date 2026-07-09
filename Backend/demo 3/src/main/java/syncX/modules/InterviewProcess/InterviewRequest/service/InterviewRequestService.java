package syncX.modules.InterviewProcess.InterviewRequest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.job.repository.JobRepository;
import syncX.modules.InterviewProcess.Availability.repository.AvailabilityDayRepository;

import syncX.modules.InterviewProcess.InterviewRequest.dto.InterviewRequestDTO;
import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequest;
import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequestInterviewer;
import syncX.modules.InterviewProcess.InterviewRequest.repository.AssignableInterviewerRepository;
import syncX.modules.InterviewProcess.InterviewRequest.repository.InterviewRequestRepository;

import syncX.modules.CompanyAdmin.CandidateHistory.dto.CandidateHistoryResponseDTO;
import syncX.modules.CompanyAdmin.CandidateHistory.service.CandidateHistoryService;
import syncX.modules.CompanyAdmin.CandidateProfile.dto.CandidateProfileResponseDTO;
import syncX.modules.CompanyAdmin.CandidateProfile.service.CandidateProfileService;

import syncX.modules.auth.entity.Company;
import syncX.modules.auth.entity.Interviewer;
import syncX.modules.auth.repository.CandidateRepository;
import syncX.modules.auth.repository.CompanyRepository;
import syncX.modules.auth.repository.InterviewerRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewRequestService {

    @Autowired private InterviewRequestRepository       requestRepo;
    @Autowired private AssignableInterviewerRepository  interviewerRepo;
    @Autowired private InterviewerRepository            fullInterviewerRepo;
    @Autowired private AvailabilityDayRepository        availabilityDayRepo;
    @Autowired private CompanyRepository                companyRepository;
    @Autowired private CandidateRepository              candidateRepository;
    @Autowired private JobRepository                    jobRepository;
    @Autowired private CandidateHistoryService          candidateHistoryService;
    @Autowired private CandidateProfileService          candidateProfileService;

    // ─────────────────────────────────────────────────────────────────────────
    // GET /assignable?date=&time=&durationMinutes=
    // Returns three groups: available, other, unavailable (conflict).
    // Conflict rule: an interviewer is UNAVAILABLE if they have an existing
    // interview_request row where their response_status is 'pending' OR 'accepted'
    // (i.e. not 'rejected') AND the time window overlaps the requested slot.
    // ─────────────────────────────────────────────────────────────────────────
    public InterviewRequestDTO.AssignableInterviewersResponse getAssignable(
            Jwt jwt, String dateStr, String timeStr, int durationMinutes) {

        UUID companyId = resolveCompanyId(jwt);
        LocalDate date = LocalDate.parse(dateStr);
        LocalTime startTime = LocalTime.parse(timeStr);
        LocalTime endTime   = startTime.plusMinutes(durationMinutes);

        List<Interviewer> all = interviewerRepo.findAssignableByCompany(companyId);

        // Which interviewers are marked available on this date (submitted availability)?
        Set<UUID> availableUserIds = availabilityDayRepo
                .findAvailableByDateAndCompany(date, companyId)
                .stream()
                .map(d -> d.getWeeklyAvailability().getUserId())
                .collect(Collectors.toSet());

        // Find all interviewers who have a CONFLICTING request on this date.
        // Conflict = existing request on same date, response_status in ('pending','accepted'),
        // and the existing interview's time window overlaps [startTime, endTime).
        // We use the existing request's duration_minutes for the end time of the existing slot.
        List<InterviewRequest> requestsOnDate =
                requestRepo.findActiveRequestsOnDate(companyId, date);

        // Build a map: interviewerUserId → conflict display string ("9:00 AM – 10:00 AM")
        Map<UUID, String> conflictMap = new HashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("h:mm a");

        for (InterviewRequest ir : requestsOnDate) {
            LocalTime irStart = ir.getInterviewTime();
            LocalTime irEnd   = irStart.plusMinutes(ir.getDurationMinutes());

            // Overlap check: new slot [startTime, endTime) overlaps existing [irStart, irEnd)
            boolean overlaps = startTime.isBefore(irEnd) && endTime.isAfter(irStart);
            if (!overlaps) continue;

            String conflictLabel = irStart.format(fmt) + " – " + irEnd.format(fmt);

            for (InterviewRequestInterviewer iri : ir.getInterviewers()) {
                String rs = iri.getResponseStatus();
                // Only block if pending or accepted — rejected means they're free
                if ("pending".equalsIgnoreCase(rs) || "accepted".equalsIgnoreCase(rs)) {
                    conflictMap.put(iri.getInterviewerUserId(), conflictLabel);
                }
            }
        }

        List<InterviewRequestDTO.InterviewerOption> available   = new ArrayList<>();
        List<InterviewRequestDTO.InterviewerOption> other       = new ArrayList<>();
        List<InterviewRequestDTO.InterviewerOption> unavailable = new ArrayList<>();

        for (Interviewer iv : all) {
            UUID uid = iv.getUserId();

            if (conflictMap.containsKey(uid)) {
                // Conflict — goes to unavailable regardless of availability status
                unavailable.add(new InterviewRequestDTO.InterviewerOption(
                        uid.toString(),
                        iv.getInterviewerId(),
                        iv.getFullName(),
                        iv.getInterviewerRole(),
                        iv.getBranch(),
                        false,
                        conflictMap.get(uid)));
            } else if (availableUserIds.contains(uid)) {
                available.add(new InterviewRequestDTO.InterviewerOption(
                        uid.toString(),
                        iv.getInterviewerId(),
                        iv.getFullName(),
                        iv.getInterviewerRole(),
                        iv.getBranch(),
                        true,
                        null));
            } else {
                other.add(new InterviewRequestDTO.InterviewerOption(
                        uid.toString(),
                        iv.getInterviewerId(),
                        iv.getFullName(),
                        iv.getInterviewerRole(),
                        iv.getBranch(),
                        false,
                        null));
            }
        }

        return new InterviewRequestDTO.AssignableInterviewersResponse(available, other, unavailable);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /current — existing request for this candidate+job
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public InterviewRequestDTO.ExistingRequestResponse getExistingRequest(
            Jwt jwt, UUID candidateId, Long jobApplicationId) {

        UUID companyId = resolveCompanyId(jwt);

        Optional<InterviewRequest> opt = requestRepo
                .findFirstActiveByCandidateAndApplication(companyId, candidateId, jobApplicationId);
        if (opt.isEmpty()) return null;

        InterviewRequest ir = opt.get();

        List<UUID> userIds = ir.getInterviewers().stream()
                .map(InterviewRequestInterviewer::getInterviewerUserId)
                .collect(Collectors.toList());

        Map<UUID, Interviewer> lookup = new HashMap<>();
        for (UUID uid : userIds) {
            fullInterviewerRepo.findByUserId(uid).ifPresent(i -> lookup.put(uid, i));
        }

        List<InterviewRequestDTO.InvitedInterviewer> invited = ir.getInterviewers().stream()
                .map(iri -> {
                    Interviewer i = lookup.get(iri.getInterviewerUserId());
                    String name = i != null ? i.getFullName() : "Unknown";
                    String role = i != null ? i.getInterviewerRole() : "";
                    return new InterviewRequestDTO.InvitedInterviewer(
                            iri.getInterviewerUserId().toString(), name, role,
                            iri.getResponseStatus());
                })
                .collect(Collectors.toList());

        return new InterviewRequestDTO.ExistingRequestResponse(
                ir.getRequestId().toString(),
                ir.getInterviewId() != null ? ir.getInterviewId() : "",
                ir.getStatus(),
                ir.getPanelSize(),
                ir.getInterviewDate() != null ? ir.getInterviewDate().toString() : "",
                safeTime(ir.getInterviewTime()),
                ir.getDurationMinutes(),
                ir.getMode(),
                ir.getAdminNotes(),
                ir.getInterviewLocation(),
                ir.getHistoryId(),
                invited);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /{requestId} — single request by id (used by the finalize popup to
    // inherit the stored interview location before a scheduled row exists)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public InterviewRequestDTO.ExistingRequestResponse getRequestById(Jwt jwt, UUID requestId) {
        UUID companyId = resolveCompanyId(jwt);
        InterviewRequest ir = requestRepo.findByIdWithInterviewers(requestId).orElse(null);
        if (ir == null) return null;
        if (!ir.getCompanyId().equals(companyId))
            throw new SecurityException("You do not own this interview request");
        return toExistingResponse(ir);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST — create interview request
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public InterviewRequestDTO.CreateResponse createRequest(
            Jwt jwt, InterviewRequestDTO.CreateRequest req) {

        UUID adminUserId = UUID.fromString(jwt.getSubject());
        UUID companyId   = resolveCompanyId(jwt);

        if (req.getPanelSize() < 1 || req.getPanelSize() > 50)
            throw new IllegalArgumentException("Panel size must be between 1 and 50");

        if (req.getInterviewerUserIds() == null || req.getInterviewerUserIds().size() < req.getPanelSize())
            throw new IllegalArgumentException(
                    "You must select at least " + req.getPanelSize() + " interviewers");

        Set<UUID> selectedSet = new HashSet<>(req.getInterviewerUserIds());
        if (selectedSet.size() != req.getInterviewerUserIds().size())
            throw new IllegalArgumentException("Duplicate interviewer in selection");

        if (req.getDurationMinutes() <= 0)
            throw new IllegalArgumentException("Duration must be greater than 0 minutes");

        LocalDate interviewDate;
        LocalTime interviewTime;
        try {
            interviewDate = LocalDate.parse(req.getInterviewDate());
            interviewTime = LocalTime.parse(req.getInterviewTime());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date or time format");
        }

        java.time.ZoneId slZone = java.time.ZoneId.of("Asia/Colombo");
        if (interviewDate.isBefore(LocalDate.now(slZone)))
            throw new IllegalArgumentException("Interview date cannot be in the past");

        // Enforce a minimum 1-hour lead time so there's always room for the interview.
        java.time.LocalDateTime interviewStart =
                java.time.LocalDateTime.of(interviewDate, interviewTime);
        if (interviewStart.isBefore(java.time.LocalDateTime.now(slZone).plusMinutes(60)))
            throw new IllegalArgumentException(
                    "Interview must be scheduled at least 1 hour from now");

        if (!"Online".equals(req.getMode()) && !"Physical".equals(req.getMode()))
            throw new IllegalArgumentException("Mode must be 'Online' or 'Physical'");

        // Validate all selected interviewers belong to this company
        Set<UUID> allowedIds = interviewerRepo.findAssignableByCompany(companyId)
                .stream().map(Interviewer::getUserId).collect(Collectors.toSet());
        for (UUID id : selectedSet) {
            if (!allowedIds.contains(id))
                throw new IllegalArgumentException(
                        "Interviewer " + id + " is not assignable to this company");
        }

        // Conflict check — reject if any selected interviewer is already booked in this window
        LocalTime newEnd = interviewTime.plusMinutes(req.getDurationMinutes());
        List<InterviewRequest> requestsOnDate =
                requestRepo.findActiveRequestsOnDate(companyId, interviewDate);

        for (InterviewRequest existing : requestsOnDate) {
            LocalTime exStart = existing.getInterviewTime();
            LocalTime exEnd   = exStart.plusMinutes(existing.getDurationMinutes());
            boolean overlaps  = interviewTime.isBefore(exEnd) && newEnd.isAfter(exStart);
            if (!overlaps) continue;

            for (InterviewRequestInterviewer iri : existing.getInterviewers()) {
                String rs = iri.getResponseStatus();
                if (selectedSet.contains(iri.getInterviewerUserId()) &&
                        ("pending".equalsIgnoreCase(rs) || "accepted".equalsIgnoreCase(rs))) {
                    throw new IllegalArgumentException(
                            "Interviewer has a conflicting request at " +
                                    exStart.toString().substring(0, 5) + " – " +
                                    exEnd.toString().substring(0, 5) +
                                    " on " + interviewDate);
                }
            }
        }

        // Cancel any existing active request for this candidate+job
        Optional<InterviewRequest> existing = requestRepo
                .findFirstActiveByCandidateAndApplication(
                        companyId, req.getCandidateId(), req.getJobApplicationId());
        if (existing.isPresent()) {
            InterviewRequest old = existing.get();
            old.setStatus("cancelled");
            for (InterviewRequestInterviewer iri : old.getInterviewers()) {
                if ("pending".equalsIgnoreCase(iri.getResponseStatus())) {
                    iri.setResponseStatus("rejected");
                    iri.setRespondedAt(OffsetDateTime.now());
                }
            }
            requestRepo.save(old);
            requestRepo.flush();
        }

        // Availability on the selected date
        Set<UUID> availableOnDate = availabilityDayRepo
                .findAvailableByDateAndCompany(interviewDate, companyId)
                .stream().map(d -> d.getWeeklyAvailability().getUserId())
                .collect(Collectors.toSet());

        // Create the new request
        InterviewRequest ir = new InterviewRequest();
        ir.setCompanyId(companyId);
        ir.setCandidateId(req.getCandidateId());
        ir.setJobApplicationId(req.getJobApplicationId());
        ir.setJobId(req.getJobId());
        ir.setHistoryId(req.getHistoryId());
        ir.setPanelSize(req.getPanelSize());
        ir.setInterviewDate(interviewDate);
        ir.setInterviewTime(interviewTime);
        ir.setDurationMinutes(req.getDurationMinutes());
        ir.setMode(req.getMode());
        ir.setAdminNotes(req.getAdminNotes());
        ir.setInterviewLocation(
                "Physical".equalsIgnoreCase(req.getMode()) ? req.getInterviewLocation() : null);
        ir.setStatus("pending");
        ir.setCreatedBy(adminUserId);

        for (UUID userId : selectedSet) {
            InterviewRequestInterviewer iri = new InterviewRequestInterviewer();
            iri.setInterviewRequest(ir);
            iri.setInterviewerUserId(userId);
            iri.setWasAvailable(availableOnDate.contains(userId));
            iri.setResponseStatus("pending");
            ir.getInterviewers().add(iri);
        }

        InterviewRequest saved = requestRepo.save(ir);

        List<String> invited = saved.getInterviewers().stream()
                .map(i -> i.getInterviewerUserId().toString())
                .collect(Collectors.toList());

        return new InterviewRequestDTO.CreateResponse(
                saved.getRequestId().toString(),
                saved.getInterviewId(),
                saved.getStatus(),
                invited);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /pending — for interviewer side
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InterviewRequestDTO.PendingRequestForInterviewer> getPendingForInterviewer(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        List<InterviewRequest> requests = requestRepo.findPendingForInterviewer(userId);

        Set<UUID> candidateIds = requests.stream()
                .map(InterviewRequest::getCandidateId).collect(Collectors.toSet());
        Set<Long> jobIds = requests.stream()
                .map(InterviewRequest::getJobId).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<UUID, String> candidateNames = new HashMap<>();
        for (UUID cid : candidateIds) {
            try {
                candidateRepository.findById(cid).ifPresent(c ->
                        candidateNames.put(cid, c.getFirstName() + " " + c.getLastName()));
            } catch (Exception e) { candidateNames.put(cid, "Unknown"); }
        }

        Map<Long, String> jobTitles = new HashMap<>();
        for (Long jid : jobIds) {
            try {
                jobRepository.findById(jid).ifPresent(j -> {
                    String t = j.getJobTitle();
                    if (t == null || t.isBlank()) t = "N/A";
                    jobTitles.put(jid, t);
                });
            } catch (Exception e) { jobTitles.put(jid, "N/A"); }
        }

        return requests.stream().map(ir -> {
            String candidateName = candidateNames.getOrDefault(ir.getCandidateId(), "Unknown");
            String jobTitle = ir.getJobId() != null ? jobTitles.getOrDefault(ir.getJobId(), "N/A") : "N/A";
            return new InterviewRequestDTO.PendingRequestForInterviewer(
                    ir.getInterviewId() != null ? ir.getInterviewId() : "",
                    ir.getRequestId().toString(),
                    candidateName,
                    jobTitle,
                    ir.getInterviewDate() != null ? ir.getInterviewDate().toString() : "",
                    safeTime(ir.getInterviewTime()),
                    ir.getDurationMinutes(),
                    ir.getMode(),
                    ir.getAdminNotes(),
                    ir.getInterviewLocation(),
                    ir.getHistoryId());
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /{requestId}/respond
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public void respondToRequest(UUID requestId, UUID userId, String response) {
        if (!"accepted".equals(response) && !"rejected".equals(response))
            throw new IllegalArgumentException("Response must be 'accepted' or 'rejected'");

        InterviewRequest ir = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        InterviewRequestInterviewer match = ir.getInterviewers().stream()
                .filter(iri -> iri.getInterviewerUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("You are not invited to this interview"));

        match.setResponseStatus(response);
        match.setRespondedAt(OffsetDateTime.now());
        requestRepo.save(ir);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /{requestId}/history — application history for an invited interviewer.
    // The interviewer only holds a requestId, so we resolve requestId →
    // jobApplicationId server-side, verify the caller is actually on this
    // request's panel, then delegate to the existing CandidateHistoryService
    // (same computed timeline the company admin sees).
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public CandidateHistoryResponseDTO getHistoryForInterviewer(Jwt jwt, UUID requestId) {
        InterviewRequest ir = requireInvitedRequest(jwt, requestId);

        Long jobApplicationId = ir.getJobApplicationId();
        if (jobApplicationId == null)
            throw new RuntimeException("This request has no linked application");

        return candidateHistoryService.getHistoryByApplication(jobApplicationId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /{requestId}/candidate-profile — full candidate profile for an
    // invited interviewer. Resolves requestId → candidateId server-side,
    // verifies panel membership, then delegates to the existing
    // CandidateProfileService (same profile the company admin sees).
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public CandidateProfileResponseDTO getCandidateProfileForInterviewer(Jwt jwt, UUID requestId) {
        InterviewRequest ir = requireInvitedRequest(jwt, requestId);

        UUID candidateId = ir.getCandidateId();
        if (candidateId == null)
            throw new RuntimeException("This request has no linked candidate");

        // jobApplicationId only drives the AI-score lookup; may be null
        return candidateProfileService.getCandidateProfile(candidateId, ir.getJobApplicationId());
    }

    /**
     * Loads a request with its panel and verifies the caller is on it.
     * Shared gate for every interviewer-side read that exposes candidate data.
     */
    private InterviewRequest requireInvitedRequest(Jwt jwt, UUID requestId) {
        UUID userId = UUID.fromString(jwt.getSubject());

        InterviewRequest ir = requestRepo.findByIdWithInterviewers(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        boolean invited = ir.getInterviewers().stream()
                .anyMatch(iri -> iri.getInterviewerUserId().equals(userId));
        if (!invited)
            throw new SecurityException("You are not invited to this interview");

        return ir;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET / (list for company)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InterviewRequestDTO.ExistingRequestResponse> listForCompany(
            Jwt jwt, Long jobApplicationId, Long jobId) {
        UUID companyId = resolveCompanyId(jwt);
        List<InterviewRequest> rows =
                requestRepo.findForCompany(companyId, jobApplicationId, jobId);
        return rows.stream().map(this::toExistingResponse).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE helpers
    // ─────────────────────────────────────────────────────────────────────────
    private InterviewRequestDTO.ExistingRequestResponse toExistingResponse(InterviewRequest ir) {
        List<UUID> userIds = ir.getInterviewers().stream()
                .map(InterviewRequestInterviewer::getInterviewerUserId)
                .collect(Collectors.toList());

        Map<UUID, Interviewer> lookup = new HashMap<>();
        for (UUID uid : userIds) {
            fullInterviewerRepo.findByUserId(uid).ifPresent(i -> lookup.put(uid, i));
        }

        List<InterviewRequestDTO.InvitedInterviewer> invited = ir.getInterviewers().stream()
                .map(iri -> {
                    Interviewer i = lookup.get(iri.getInterviewerUserId());
                    String name = i != null ? i.getFullName() : "Unknown";
                    String role = i != null ? i.getInterviewerRole() : "";
                    return new InterviewRequestDTO.InvitedInterviewer(
                            iri.getInterviewerUserId().toString(), name, role,
                            iri.getResponseStatus());
                })
                .collect(Collectors.toList());

        return new InterviewRequestDTO.ExistingRequestResponse(
                ir.getRequestId().toString(),
                ir.getInterviewId() != null ? ir.getInterviewId() : "",
                ir.getStatus(),
                ir.getPanelSize(),
                ir.getInterviewDate() != null ? ir.getInterviewDate().toString() : "",
                safeTime(ir.getInterviewTime()),
                ir.getDurationMinutes(),
                ir.getMode(),
                ir.getAdminNotes(),
                ir.getInterviewLocation(),
                ir.getHistoryId(),
                invited);
    }

    private String safeTime(LocalTime t) {
        if (t == null) return "";
        String s = t.toString();
        return s.length() >= 5 ? s.substring(0, 5) : s;
    }

    private UUID resolveCompanyId(Jwt jwt) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        Company company  = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return company.getCompanyId();
    }
}