package syncX.modules.InterviewProcess.lifecycle.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequest;
import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequestInterviewer;
import syncX.modules.InterviewProcess.InterviewRequest.repository.InterviewRequestRepository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Business logic for the interview-lifecycle transitions. Each pass runs in its
 * own transaction so it commits atomically.
 *
 * Status vocabularies (enforced by DB check constraints — do not invent values):
 *
 *   interview_requests.status                pending | finalized | cancelled
 *   interview_request_interviewers
 *       .response_status                     pending | accepted | rejected | timed_out
 *   interview_scheduled.status               scheduled | completed | cancelled
 *                                            (no DB constraint, but keep to these)
 *
 * Only requests are swept here. interview_scheduled is never written by this
 * service — see the note at the bottom of the class.
 */
@Service
public class InterviewLifecycleService {

    @Autowired private InterviewRequestRepository requestRepo;

    /**
     * Rule 1: PENDING requests whose interview date has passed → CANCELLED.
     *
     * Nobody confirmed a full panel before the date arrived, so the request
     * lapses. "cancelled" is the terminal state the schema provides for this —
     * there is deliberately no separate "rejected" state on a request.
     *
     * Any interviewer row on that request still sitting at "pending" is flipped
     * to "timed_out" so the admin-facing status popup (which already has a
     * "Timed Out" badge wired up) reflects reality instead of showing a stale
     * "Pending" for interviewers who never got a chance to respond.
     */
    @Transactional
    public int cancelPendingPastDate() {
        LocalDate today = LocalDate.now();

        List<InterviewRequest> stale =
                requestRepo.findByStatusAndInterviewDateBeforeWithInterviewers("pending", today);

        OffsetDateTime now = OffsetDateTime.now();
        for (InterviewRequest r : stale) {
            r.setStatus("cancelled");
            // updatedAt is DB-managed (insertable/updatable = false on the entity),
            // so there is no setUpdatedAt(now) call here — it would be a silent no-op.

            for (InterviewRequestInterviewer iri : r.getInterviewers()) {
                if ("pending".equalsIgnoreCase(iri.getResponseStatus())) {
                    iri.setResponseStatus("timed_out");
                    iri.setRespondedAt(now);
                }
            }
        }
        requestRepo.saveAll(stale);
        return stale.size();
    }

    // There is deliberately no timed rule for interview_scheduled rows. A scheduled
    // interview whose date has passed stays "scheduled" — it is not auto-completed,
    // not auto-expired, and not hidden. It leaves that state only when every accepted
    // panelist submits their evaluation (→ completed), when the company admin records
    // a pass/fail decision, or when the company admin cancels it (→ cancelled).
}