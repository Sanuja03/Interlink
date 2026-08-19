package syncX.modules.InterviewProcess.InterviewRequest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

public class InterviewRequestDTO {

    // REQUEST: admin creates an interview request
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private UUID   candidateId;
        private Long   jobApplicationId;
        private Long   jobId;
        private Long   historyId;
        private short  panelSize;
        private String interviewDate;
        private String interviewTime;
        private short  durationMinutes;
        private String mode;
        private String adminNotes;
        private String interviewLocation;   // ← Physical venue; null for Online
        private List<UUID> interviewerUserIds;
    }

    // RESPONSE: interviewer option for the picker
    @Getter
    @AllArgsConstructor
    public static class InterviewerOption {
        private String  userId;
        private String  interviewerId;
        private String  fullName;
        private String  role;
        private String  branch;
        private boolean available;
        private String  conflictInfo;       // null if no conflict, "HH:MM – HH:MM" if busy
    }

    @Getter
    @AllArgsConstructor
    public static class AssignableInterviewersResponse {
        private List<InterviewerOption> available;
        private List<InterviewerOption> other;
        private List<InterviewerOption> unavailable;  // schedule conflict group
    }

    // RESPONSE: after creating a request
    @Getter
    @AllArgsConstructor
    public static class CreateResponse {
        private String requestId;
        private String interviewId;
        private String status;
        private List<String> invitedInterviewerUserIds;
    }

    // RESPONSE: existing request (for popup pre-fill)
    @Getter
    @AllArgsConstructor
    public static class InvitedInterviewer {
        private String userId;
        private String fullName;
        private String role;
        private String responseStatus;
    }

    @Getter
    @AllArgsConstructor
    public static class ExistingRequestResponse {
        private String requestId;
        private String interviewId;
        private String status;
        private short  panelSize;
        private String interviewDate;
        private String interviewTime;
        private short  durationMinutes;
        private String mode;
        private String adminNotes;
        private String interviewLocation;   // ← Physical venue; null for Online
        private Long   historyId;
        private List<InvitedInterviewer> invitedInterviewers;
    }

    // RESPONSE: pending request as seen by an interviewer
    @Getter
    @AllArgsConstructor
    public static class PendingRequestForInterviewer {
        private String interviewId;
        private String requestId;
        private String candidateName;
        private String jobTitle;
        private String interviewDate;
        private String interviewTime;
        private short  durationMinutes;
        private String mode;
        private String adminNotes;
        private String interviewLocation;   // ← Physical venue; null for Online
        private Long   historyId;
    }

    /**
     * RESPONSE: a request this interviewer was on but no longer holds.
     *
     * outcome is one of:
     *   removed      — the request is still live, but their seat on the panel is gone
     *   cancelled    — the whole request was cancelled
     *   rescheduled  — cancelled and replaced by a newer request for the same
     *                  candidate + application ("Cancel & Redo")
     *
     * The new* fields carry the replacement slot and are null unless the
     * outcome is "rescheduled".
     */
    @Getter
    @AllArgsConstructor
    public static class WithdrawnRequestForInterviewer {
        private String  interviewId;
        private String  requestId;
        private String  candidateName;
        private String  jobTitle;
        private String  interviewDate;
        private String  interviewTime;
        private String  mode;
        private String  outcome;
        private String  withdrawnAt;        // when their row was flipped; may be null
        private String  newInterviewId;
        private String  newInterviewDate;
        private String  newInterviewTime;
        private boolean invitedAgain;       // re-invited onto the replacement panel?
    }

    // REQUEST: interviewer responds (accept/decline)
    @Getter
    @Setter
    @NoArgsConstructor
    public static class RespondRequest {
        private String response;
    }
}