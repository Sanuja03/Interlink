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
        private UUID candidateId;
        private Long jobApplicationId;
        private Long jobId;
        private Long historyId;   // bigint, from candidate_history.history_id
        private short panelSize;
        private String interviewDate;
        private String interviewTime;
        private String mode;
        private String adminNotes;
        private List<UUID> interviewerUserIds;
    }


    // RESPONSE: interviewer option for the picker
    @Getter
    @AllArgsConstructor
    public static class InterviewerOption {
        private String userId;
        private String interviewerId;
        private String fullName;
        private String role;
        private String branch;
        private boolean available;
    }


    @Getter
    @AllArgsConstructor
    public static class AssignableInterviewersResponse {
        private List<InterviewerOption> available;
        private List<InterviewerOption> other;
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
        private short panelSize;
        private String interviewDate;
        private String interviewTime;
        private String mode;
        private String adminNotes;
        private Long historyId;   // bigint, plain number in the JSON
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
        private String mode;
        private String adminNotes;
        private Long historyId;
    }


    // REQUEST: interviewer responds (accept/decline)
    @Getter
    @Setter
    @NoArgsConstructor
    public static class RespondRequest {
        private String response; // "accepted" or "declined"
    }
}