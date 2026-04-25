package syncX.modules.InterviewProcess.InterviewRequestStatus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequest;
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

    @Autowired private InterviewRequestRepository  requestRepo;
    @Autowired private InterviewerRepository       interviewerRepo;
    @Autowired private CompanyRepository           companyRepository;

    // ════════════════════════════════════════════════════════════════
    // GET: full status of the active (non-cancelled) request for
    //      a (candidateId, jobApplicationId) pair — scoped to the
    //      calling admin's company.
    // ════════════════════════════════════════════════════════════════
    public InterviewRequestStatusDTO.StatusResponse getStatus(
            Jwt jwt, UUID candidateId, Long jobApplicationId) {

        UUID companyId = resolveCompanyId(jwt);

        Optional<InterviewRequest> opt = requestRepo
                .findFirstActiveByCandidateAndApplication(companyId, candidateId, jobApplicationId);

        if (opt.isEmpty()) return null;   // caller should return 204

        return buildStatusResponse(opt.get());
    }

    // ════════════════════════════════════════════════════════════════
    // DELETE: remove one interviewer from an active request.
    //
    //  Rules
    //  ─────
    //  • Only the company that owns the request may remove interviewers.
    //  • The request must not be finalised or cancelled.
    //  • The interviewer's responseStatus is set to "rejected" so it
    //    disappears from their pending-requests page automatically
    //    (the existing query filters for responseStatus = 'pending').
    //  • We do NOT physically delete the row — we just flip the status
    //    so audit history is preserved.
    // ════════════════════════════════════════════════════════════════
    @Transactional
    public InterviewRequestStatusDTO.RemoveInterviewerResponse removeInterviewer(
            Jwt jwt, UUID requestId, UUID interviewerUserId) {

        UUID companyId = resolveCompanyId(jwt);

        InterviewRequest ir = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        // Security: make sure this request belongs to the caller's company
        if (!ir.getCompanyId().equals(companyId)) {
            throw new SecurityException("You do not own this interview request");
        }

        // Guard: cannot mutate a finalised or cancelled request
        if ("finalised".equalsIgnoreCase(ir.getStatus()) ||
                "cancelled".equalsIgnoreCase(ir.getStatus())) {
            throw new IllegalStateException(
                    "Cannot remove an interviewer from a " + ir.getStatus() + " request");
        }

        // Find the interviewer row
        InterviewRequestInterviewer target = ir.getInterviewers().stream()
                .filter(iri -> iri.getInterviewerUserId().equals(interviewerUserId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "Interviewer " + interviewerUserId + " is not part of this request"));

        // Flip to rejected — this removes them from the interviewer's pending list
        // (the existing query filters WHERE responseStatus = 'pending')
        target.setResponseStatus("rejected");
        target.setRespondedAt(OffsetDateTime.now());

        requestRepo.save(ir);

        // Re-compute counts from the persisted state
        // (exclude the just-rejected row when counting "remaining active")
        List<InterviewRequestInterviewer> stillActive = ir.getInterviewers().stream()
                .filter(iri -> !"rejected".equalsIgnoreCase(iri.getResponseStatus()))
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

    // ════════════════════════════════════════════════════════════════
    // PUT: resend to a rejected interviewer — resets their status to "pending"
    //      so the request reappears in their pending-requests page.
    // ════════════════════════════════════════════════════════════════
    @Transactional
    public void resendToInterviewer(Jwt jwt, UUID requestId, UUID interviewerUserId) {

        UUID companyId = resolveCompanyId(jwt);

        InterviewRequest ir = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Interview request not found"));

        if (!ir.getCompanyId().equals(companyId)) {
            throw new SecurityException("You do not own this interview request");
        }

        if ("finalised".equalsIgnoreCase(ir.getStatus()) ||
                "cancelled".equalsIgnoreCase(ir.getStatus())) {
            throw new IllegalStateException(
                    "Cannot resend for a " + ir.getStatus() + " request");
        }

        InterviewRequestInterviewer target = ir.getInterviewers().stream()
                .filter(iri -> iri.getInterviewerUserId().equals(interviewerUserId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "Interviewer " + interviewerUserId + " is not part of this request"));

        // Only allow resend if currently rejected (interviewer declined)
        if (!"rejected".equalsIgnoreCase(target.getResponseStatus())) {
            throw new IllegalStateException(
                    "Can only resend to an interviewer who has rejected the request");
        }

        // Reset back to pending — reappears in interviewer's pending list
        target.setResponseStatus("pending");
        target.setRespondedAt(null);
        requestRepo.save(ir);
    }

    // ════════════════════════════════════════════════════════════════
    // PRIVATE helpers
    // ════════════════════════════════════════════════════════════════

    private InterviewRequestStatusDTO.StatusResponse buildStatusResponse(InterviewRequest ir) {

        // Batch-load interviewer profiles
        List<UUID> userIds = ir.getInterviewers().stream()
                .map(InterviewRequestInterviewer::getInterviewerUserId)
                .collect(Collectors.toList());

        Map<UUID, Interviewer> lookup = new HashMap<>();
        for (UUID uid : userIds) {
            interviewerRepo.findByUserId(uid).ifPresent(i -> lookup.put(uid, i));
        }

        // Only show interviewers who have NOT been removed (i.e. not "rejected" via admin removal).
        // We distinguish admin-removal (was never pending→accepted→rejected naturally) from
        // a genuine interviewer decline by checking wasAvailable or just showing all statuses
        // so the admin can see the full picture and use the Remove button themselves.
        // Per the brief: show ALL invited interviewers with their current status.
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