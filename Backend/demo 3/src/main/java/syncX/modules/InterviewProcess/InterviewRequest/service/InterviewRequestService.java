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

import syncX.modules.auth.entity.Company;
import syncX.modules.auth.entity.Interviewer;
import syncX.modules.auth.repository.CandidateRepository;
import syncX.modules.auth.repository.CompanyRepository;
import syncX.modules.auth.repository.InterviewerRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewRequestService {

    @Autowired private InterviewRequestRepository requestRepo;
    @Autowired private AssignableInterviewerRepository interviewerRepo;
    @Autowired private InterviewerRepository fullInterviewerRepo;
    @Autowired private AvailabilityDayRepository availabilityDayRepo;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private CandidateRepository candidateRepository;
    @Autowired private JobRepository jobRepository;

    // ════════════════════════════════════════════════════════════════
    public InterviewRequestDTO.AssignableInterviewersResponse getAssignable(
            Jwt jwt, String dateStr) {

        UUID companyId = resolveCompanyId(jwt);
        LocalDate date = LocalDate.parse(dateStr);

        List<Interviewer> all = interviewerRepo.findAssignableByCompany(companyId);

        Set<UUID> availableUserIds = availabilityDayRepo
                .findAvailableByDateAndCompany(date, companyId)
                .stream()
                .map(d -> d.getWeeklyAvailability().getUserId())
                .collect(Collectors.toSet());

        List<InterviewRequestDTO.InterviewerOption> available = new ArrayList<>();
        List<InterviewRequestDTO.InterviewerOption> other = new ArrayList<>();

        for (Interviewer iv : all) {
            boolean isAvailable = availableUserIds.contains(iv.getUserId());
            InterviewRequestDTO.InterviewerOption opt =
                    new InterviewRequestDTO.InterviewerOption(
                            iv.getUserId().toString(),
                            iv.getInterviewerId(),
                            iv.getFullName(),
                            iv.getInterviewerRole(),
                            iv.getBranch(),
                            isAvailable);
            if (isAvailable) available.add(opt);
            else other.add(opt);
        }

        return new InterviewRequestDTO.AssignableInterviewersResponse(available, other);
    }

    // ════════════════════════════════════════════════════════════════
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
                ir.getMode(),
                ir.getAdminNotes(),
                ir.getHistoryId(),
                invited);
    }

    // ════════════════════════════════════════════════════════════════
    @Transactional
    public InterviewRequestDTO.CreateResponse createRequest(
            Jwt jwt, InterviewRequestDTO.CreateRequest req) {

        UUID adminUserId = UUID.fromString(jwt.getSubject());
        UUID companyId = resolveCompanyId(jwt);

        if (req.getPanelSize() < 1 || req.getPanelSize() > 50)
            throw new IllegalArgumentException("Panel size must be between 1 and 50");

        if (req.getInterviewerUserIds() == null
                || req.getInterviewerUserIds().size() < req.getPanelSize())
            throw new IllegalArgumentException(
                    "You must select at least " + req.getPanelSize() + " interviewers");

        Set<UUID> selectedSet = new HashSet<>(req.getInterviewerUserIds());
        if (selectedSet.size() != req.getInterviewerUserIds().size())
            throw new IllegalArgumentException("Duplicate interviewer in selection");

        LocalDate interviewDate;
        LocalTime interviewTime;
        try {
            interviewDate = LocalDate.parse(req.getInterviewDate());
            interviewTime = LocalTime.parse(req.getInterviewTime());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date or time format");
        }

        if (interviewDate.isBefore(LocalDate.now()))
            throw new IllegalArgumentException("Interview date cannot be in the past");

        if (!"Online".equals(req.getMode()) && !"Physical".equals(req.getMode()))
            throw new IllegalArgumentException("Mode must be 'Online' or 'Physical'");

        Set<UUID> allowedIds = interviewerRepo.findAssignableByCompany(companyId)
                .stream().map(Interviewer::getUserId).collect(Collectors.toSet());

        for (UUID id : selectedSet) {
            if (!allowedIds.contains(id))
                throw new IllegalArgumentException(
                        "Interviewer " + id + " is not assignable to this company");
        }

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

        Set<UUID> availableOnDate = availabilityDayRepo
                .findAvailableByDateAndCompany(interviewDate, companyId)
                .stream().map(d -> d.getWeeklyAvailability().getUserId())
                .collect(Collectors.toSet());

        InterviewRequest ir = new InterviewRequest();
        ir.setCompanyId(companyId);
        ir.setCandidateId(req.getCandidateId());
        ir.setJobApplicationId(req.getJobApplicationId());
        ir.setJobId(req.getJobId());
        ir.setHistoryId(req.getHistoryId());
        ir.setPanelSize(req.getPanelSize());
        ir.setInterviewDate(interviewDate);
        ir.setInterviewTime(interviewTime);
        ir.setMode(req.getMode());
        ir.setAdminNotes(req.getAdminNotes());
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

    // ════════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<InterviewRequestDTO.PendingRequestForInterviewer> getPendingForInterviewer(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        List<InterviewRequest> requests = requestRepo.findPendingForInterviewer(userId);

        Set<UUID> candidateIds = requests.stream()
                .map(InterviewRequest::getCandidateId)
                .collect(Collectors.toSet());
        Set<Long> jobIds = requests.stream()
                .map(InterviewRequest::getJobId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Safely fetch candidate names — skip any candidate with corrupt date_of_birth data
        Map<UUID, String> candidateNames = new HashMap<>();
        for (UUID cid : candidateIds) {
            try {
                candidateRepository.findById(cid).ifPresent(c ->
                        candidateNames.put(cid, c.getFirstName() + " " + c.getLastName()));
            } catch (Exception e) {
                candidateNames.put(cid, "Unknown");
            }
        }

        Map<Long, String> jobTitles = new HashMap<>();
        for (Long jid : jobIds) {
            try {
                jobRepository.findById(jid).ifPresent(j -> {
                    String t = j.getJobTitle();
                    if (t == null || t.isBlank()) t = "N/A";
                    jobTitles.put(jid, t);
                });
            } catch (Exception e) {
                jobTitles.put(jid, "N/A");
            }
        }

        return requests.stream().map(ir -> {
            String candidateName = candidateNames.getOrDefault(ir.getCandidateId(), "Unknown");
            String jobTitle = ir.getJobId() != null
                    ? jobTitles.getOrDefault(ir.getJobId(), "N/A")
                    : "N/A";

            return new InterviewRequestDTO.PendingRequestForInterviewer(
                    ir.getInterviewId() != null ? ir.getInterviewId() : "",
                    ir.getRequestId().toString(),
                    candidateName,
                    jobTitle,
                    ir.getInterviewDate() != null ? ir.getInterviewDate().toString() : "",
                    safeTime(ir.getInterviewTime()),
                    ir.getMode(),
                    ir.getAdminNotes(),
                    ir.getHistoryId()
            );
        }).collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════
    @Transactional
    public void respondToRequest(UUID requestId, UUID userId, String response) {
        if (!"accepted".equals(response) && !"rejected".equals(response)) {
            throw new IllegalArgumentException("Response must be 'accepted' or 'rejected'");
        }

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

    // ════════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<InterviewRequestDTO.ExistingRequestResponse> listForCompany(
            Jwt jwt, Long jobApplicationId, Long jobId) {

        UUID companyId = resolveCompanyId(jwt);
        List<InterviewRequest> rows =
                requestRepo.findForCompany(companyId, jobApplicationId, jobId);

        return rows.stream().map(this::toExistingResponse).collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════
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
                ir.getMode(),
                ir.getAdminNotes(),
                ir.getHistoryId(),
                invited);
    }

    // ════════════════════════════════════════════════════════════════
    private String safeTime(LocalTime t) {
        if (t == null) return "";
        String s = t.toString();
        return s.length() >= 5 ? s.substring(0, 5) : s;
    }

    private UUID resolveCompanyId(Jwt jwt) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        Company company = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return company.getCompanyId();
    }
}