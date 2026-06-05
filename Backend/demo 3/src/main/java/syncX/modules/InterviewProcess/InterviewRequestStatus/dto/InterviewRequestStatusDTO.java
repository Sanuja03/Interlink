package syncX.modules.InterviewProcess.InterviewRequestStatus.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

public class InterviewRequestStatusDTO {


    // RESPONSE: full status view of an active request
    @Getter
    @AllArgsConstructor
    public static class StatusResponse {
        private String requestId;
        private String interviewId;
        private String overallStatus;   // "pending" | "finalized" | "cancelled"
        private short  panelSize;
        private String interviewDate;
        private String interviewTime;
        private String mode;
        private String adminNotes;
        private Long   historyId;
        private List<InterviewerStatus> interviewers;
    }


    // Each interviewer row in the status list
    @Getter
    @AllArgsConstructor
    public static class InterviewerStatus {
        private String  userId;
        private String  fullName;
        private String  role;
        private String  responseStatus;  // "pending" | "accepted" | "rejected"
        private boolean wasAvailable;
    }


    // REQUEST: add interviewers to existing request
    @Getter
    @Setter
    @NoArgsConstructor
    public static class AddInterviewersRequest {
        private List<UUID> interviewerUserIds;
    }


    // RESPONSE: summary counts (used after a remove)
    @Getter
    @AllArgsConstructor
    public static class RemoveInterviewerResponse {
        private String requestId;
        private String removedUserId;
        private int    remainingCount;
        private int    acceptedCount;
    }
}