package syncX.modules.InterviewProcess.InterviewRequestStatus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequest;
import syncX.modules.InterviewProcess.InterviewRequest.repository.AssignableInterviewerRepository;
import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequestInterviewer;
import syncX.modules.InterviewProcess.InterviewRequest.repository.InterviewRequestRepository;
import syncX.modules.InterviewProcess.InterviewRequestStatus.dto.InterviewRequestStatusDTO;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.entity.Interviewer;
import syncX.modules.auth.repository.CompanyRepository;
import syncX.modules.auth.repository.InterviewerRepository;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewRequestStatusService {

    @Autowired private InterviewRequestRepository       requestRepo;
    @Autowired private AssignableInterviewerRepository  assignableRepo;
    @Autowired private InterviewerRepository       interviewerRepo;
    @Autowired private CompanyRepository           companyRepository;


    // For the logged-in company, check whether this specific candidate
    // for this specific job application already has an active interview request.
    // If yes, return the status details. If no, return null.
    public InterviewRequestStatusDTO.StatusResponse getStatus(
            Jwt jwt, UUID candidateId, Long jobApplicationId) {

        UUID companyId = resolveCompanyId(jwt);

        Optional<InterviewRequest> opt = requestRepo
                .findFirstActiveByCandidateAndApplication(companyId, candidateId, jobApplicationId);

        if (opt.isEmpty()) return null;

        return buildStatusResponse(opt.get());
    }


    //  Only the company that owns the request may remove interviewers.
    //  The request must still be "pending" — a finalized request is locked, and
    //  a cancelled one has already lapsed (the lifecycle job cancels requests
    //  whose interview date passed without a confirmed panel).
    //  The interviewer's responseStatus is set to "rejected" so it
    //  disappears from their pending-requests page automatically.
    //  We do NOT physically delete the row — we just flip the status
    //  so audit history is preserved.
    @Transactional
    public InterviewRequestStatusDTO.RemoveInterviewerResponse removeInterviewer(
            Jwt jwt, UUID requestId, UUID interviewerUserId) {

        UUID companyId = resolveCompanyId(jwt);

        InterviewRequest ir = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        assertOwnedBy(ir, companyId);
        assertMutable(ir, "remove an interviewer from");

        // Find the interviewer row for the relevant request id
        InterviewRequestInterviewer target = findInterviewer(ir, interviewerUserId);

        // Flip to rejected — this removes them from the interviewer's pending list
        target.setResponseStatus("rejected");
        target.setRespondedAt(OffsetDateTime.now());

        requestRepo.save(ir);

        // "Remaining active" excludes anyone who is out of the running: an
        // interviewer who declined, one the admin removed (also "rejected"),
        // and one the lifecycle job timed out.
        List<InterviewRequestInterviewer> stillActive = ir.getInterviewers().stream()
                .filter(iri -> !"rejected".equalsIgnoreCase(iri.getResponseStatus())
                        && !"timed_out".equalsIgnoreCase(iri.getResponseStatus()))
                .collect(Collectors.toList());

        long acceptedCount = stillActive.stream()
                .filter(iri -> "accepted".equalsIgnoreCase(iri.getResponseStatus()))
                .count();

        return new InterviewRequestStatusDTO.RemoveInterviewerResponse(
                requestId.toString(),
                interviewerUserId.toString(),
                stillActive.size(),
                (int) acceptedCount);
    }


    // PUT: resend to a rejected interviewer — resets their status to "pending"
    @Transactional
    public void resendToInterviewer(Jwt jwt, UUID requestId, UUID interviewerUserId) {

        UUID companyId = resolveCompanyId(jwt);

        InterviewRequest ir = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        assertOwnedBy(ir, companyId);
        assertMutable(ir, "resend for");

        InterviewRequestInterviewer target = findInterviewer(ir, interviewerUserId);

        // Only allow resend if currently rejected (interviewer declined, or the
        // admin removed them). A "timed_out" interviewer belongs to a request
        // whose date has already passed, so assertMutable above has already
        // rejected that case.
        if (!"rejected".equalsIgnoreCase(target.getResponseStatus())) {
            throw new IllegalStateException(
                    "Can only resend to an interviewer who has rejected the request");
        }

        // Reset back to pending — reappears in interviewer's pending list
        target.setResponseStatus("pending");
        target.setRespondedAt(null);
        requestRepo.save(ir);
    }


    // POST: add more interviewers to an existing pending request.
    //  Skips any userId already in the request (no duplicates).
    //  Only adds — never touches accepted/pending existing rows.
    //  Validates that every added userId belongs to this company.
    @Transactional
    public InterviewRequestStatusDTO.StatusResponse addInterviewers(
            Jwt jwt, UUID requestId, List<UUID> newUserIds) {

        UUID companyId = resolveCompanyId(jwt);

        InterviewRequest ir = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        assertOwnedBy(ir, companyId);
        assertMutable(ir, "add interviewers to");

        // Validate all new IDs belong to this company
        Set<UUID> allowedIds = assignableRepo.findAssignableByCompany(companyId)
                .stream().map(i -> i.getUserId()).collect(Collectors.toSet());
        for (UUID uid : newUserIds) {
            if (!allowedIds.contains(uid))
                throw new IllegalArgumentException(
                        "Interviewer " + uid + " is not assignable to this company");
        }

        // new IDs already in the request then skip to avoid duplicates
        Set<UUID> existing = ir.getInterviewers().stream()
                .map(InterviewRequestInterviewer::getInterviewerUserId)
                .collect(Collectors.toSet());

        for (UUID uid : newUserIds) {
            if (existing.contains(uid)) continue; // already invited then skip
            InterviewRequestInterviewer iri = new InterviewRequestInterviewer();
            iri.setInterviewRequest(ir);
            iri.setInterviewerUserId(uid);
            iri.setWasAvailable(false); // availability not re-checked on add
            iri.setResponseStatus("pending");
            ir.getInterviewers().add(iri);
        }

        requestRepo.save(ir);
        return buildStatusResponse(ir);
    }


    // PRIVATE helpers

    /**
     * A request can only be mutated while it is still "pending". The schema
     * allows exactly three values (pending | finalized | cancelled), so this
     * single check covers both terminal states — there is no separate
     * "rejected" request status to guard against.
     */
    private void assertMutable(InterviewRequest ir, String action) {
        if (!"pending".equalsIgnoreCase(ir.getStatus())) {
            throw new IllegalStateException(
                    "Cannot " + action + " a " + ir.getStatus() + " request");
        }
    }

    private void assertOwnedBy(InterviewRequest ir, UUID companyId) {
        if (!ir.getCompanyId().equals(companyId)) {
            throw new SecurityException("You do not own this interview request");
        }
    }

    private InterviewRequestInterviewer findInterviewer(InterviewRequest ir, UUID interviewerUserId) {
        return ir.getInterviewers().stream()
                .filter(iri -> iri.getInterviewerUserId().equals(interviewerUserId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "Interviewer " + interviewerUserId + " is not part of this request"));
    }

    private InterviewRequestStatusDTO.StatusResponse buildStatusResponse(InterviewRequest ir) {

        // Batch-load interviewer profiles
        List<UUID> userIds = ir.getInterviewers().stream()
                .map(InterviewRequestInterviewer::getInterviewerUserId)
                .collect(Collectors.toList());

        Map<UUID, Interviewer> lookup = new HashMap<>();
        for (UUID uid : userIds) {
            interviewerRepo.findByUserId(uid).ifPresent(i -> lookup.put(uid, i));
        }

        // Show ALL invited interviewers with their current status — including
        // "timed_out" rows written by the lifecycle job. The frontend renders a
        // distinct badge for each, so the admin sees the full picture.
        List<InterviewRequestStatusDTO.InterviewerStatus> statusList =
                ir.getInterviewers().stream()
                        .map(iri -> {
                            Interviewer iv = lookup.get(iri.getInterviewerUserId());
                            String name = iv != null ? iv.getFullName()        : "Unknown";
                            String role = iv != null ? iv.getInterviewerRole() : "";
                            return new InterviewRequestStatusDTO.InterviewerStatus(
                                    iri.getInterviewerUserId().toString(),
                                    name,
                                    role,
                                    iri.getResponseStatus(),
                                    iri.isWasAvailable());
                        })
                        .collect(Collectors.toList());

        return new InterviewRequestStatusDTO.StatusResponse(
                ir.getRequestId().toString(),
                ir.getInterviewId(),
                ir.getStatus(),
                ir.getPanelSize(),
                ir.getInterviewDate().toString(),
                ir.getInterviewTime().toString().substring(0, 5),
                ir.getMode(),
                ir.getAdminNotes(),
                ir.getInterviewLocation(),
                ir.getHistoryId(),
                statusList);
    }

    private UUID resolveCompanyId(Jwt jwt) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        Company company  = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found for this admin"));
        return company.getCompanyId();
    }
}