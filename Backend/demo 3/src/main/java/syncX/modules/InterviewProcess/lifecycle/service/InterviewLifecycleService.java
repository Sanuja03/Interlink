package syncX.modules.InterviewProcess.lifecycle.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequest;
import syncX.modules.InterviewProcess.InterviewRequest.entity.InterviewRequestInterviewer;
import syncX.modules.InterviewProcess.InterviewRequest.repository.InterviewRequestRepository;
import syncX.modules.InterviewProcess.InterviewScheduling.entity.InterviewScheduled;
import syncX.modules.InterviewProcess.InterviewScheduling.repository.InterviewScheduledRepository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Business logic for the interview-lifecycle transitions. Each pass runs in its
 * own transaction so it commits atomically.
 *
 * "Evaluated" = at least one interviewer submitted their scores for that
 * scheduled interview (interviewer_score_submissions.is_submitted = true).
 * That table has no JPA entity, so the check is a native query on the repo.
 */
@Service
public class InterviewLifecycleService {

    @Autowired private InterviewRequestRepository   requestRepo;
    @Autowired private InterviewScheduledRepository scheduledRepo;

    /**
     * Rule 1: PENDING requests whose interview date has passed → REJECTED.
     * (No panelist responded in time; recorded as a decision.)
     *
     * Any interviewer row on that request still sitting at "pending" is
     * flipped to "timed_out" so the admin-facing status popup (which already
     * has a "Timed Out" badge wired up) reflects reality instead of showing
     * a stale "Pending" for interviewers who never got a chance to respond.
     */
    @Transactional
    public int expirePendingPastDate() {
        LocalDate today = LocalDate.now();

        List<InterviewRequest> stale =
                requestRepo.findByStatusAndInterviewDateBeforeWithInterviewers("pending", today);

        OffsetDateTime now = OffsetDateTime.now();
        for (InterviewRequest r : stale) {
            r.setStatus("rejected");
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

    /**
     * Rule 2: SCHEDULED interviews whose date has passed →
     *   COMPLETED if an evaluation was submitted, else EXPIRED.
     */
    @Transactional
    public int completeOrExpireScheduledPastDate() {
        LocalDate today = LocalDate.now();

        List<InterviewScheduled> stale =
                scheduledRepo.findByStatusAndInterviewDateBefore("scheduled", today);

        int changed = 0;
        for (InterviewScheduled s : stale) {
            boolean evaluated = scheduledRepo.hasSubmittedEvaluation(s.getScheduledId());
            s.setStatus(evaluated ? "completed" : "expired");
            // updatedAt is DB-managed (insertable/updatable = false on the entity),
            // so there is no setUpdatedAt(now) call here — it would be a silent no-op.
            changed++;
        }
        scheduledRepo.saveAll(stale);
        return changed;
    }
}