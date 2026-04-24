package syncX.modules.InterviewProcess.InterviewRequestStatus.dto;

import java.util.List;

public class InterviewRequestStatusDTO {

    // ────────────────────────────────────────────────
    // RESPONSE: full status view of an active request
    // ────────────────────────────────────────────────
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

        public StatusResponse(String requestId, String interviewId, String overallStatus,
                              short panelSize, String interviewDate, String interviewTime,
                              String mode, String adminNotes, Long historyId,
                              List<InterviewerStatus> interviewers) {
            this.requestId     = requestId;
            this.interviewId   = interviewId;
            this.overallStatus = overallStatus;
            this.panelSize     = panelSize;
            this.interviewDate = interviewDate;
            this.interviewTime = interviewTime;
            this.mode          = mode;
            this.adminNotes    = adminNotes;
            this.historyId     = historyId;
            this.interviewers  = interviewers;
        }

        public String getRequestId()      { return requestId; }
        public String getInterviewId()    { return interviewId; }
        public String getOverallStatus()  { return overallStatus; }
        public short  getPanelSize()      { return panelSize; }
        public String getInterviewDate()  { return interviewDate; }
        public String getInterviewTime()  { return interviewTime; }
        public String getMode()           { return mode; }
        public String getAdminNotes()     { return adminNotes; }
        public Long   getHistoryId()      { return historyId; }
        public List<InterviewerStatus> getInterviewers() { return interviewers; }
    }

    // ────────────────────────────────────────────────
    // Each interviewer row in the status list
    // ────────────────────────────────────────────────
    public static class InterviewerStatus {
        private String  userId;
        private String  fullName;
        private String  role;
        private String  responseStatus;  // "pending" | "accepted" | "rejected"
        private boolean wasAvailable;

        public InterviewerStatus(String userId, String fullName, String role,
                                 String responseStatus, boolean wasAvailable) {
            this.userId         = userId;
            this.fullName       = fullName;
            this.role           = role;
            this.responseStatus = responseStatus;
            this.wasAvailable   = wasAvailable;
        }

        public String  getUserId()         { return userId; }
        public String  getFullName()       { return fullName; }
        public String  getRole()           { return role; }
        public String  getResponseStatus() { return responseStatus; }
        public boolean isWasAvailable()    { return wasAvailable; }
    }

    // ────────────────────────────────────────────────
    // RESPONSE: summary counts (used after a remove)
    // ────────────────────────────────────────────────
    public static class RemoveInterviewerResponse {
        private String requestId;
        private String removedUserId;
        private int    remainingCount;
        private int    acceptedCount;

        public RemoveInterviewerResponse(String requestId, String removedUserId,
                                         int remainingCount, int acceptedCount) {
            this.requestId      = requestId;
            this.removedUserId  = removedUserId;
            this.remainingCount = remainingCount;
            this.acceptedCount  = acceptedCount;
        }

        public String getRequestId()      { return requestId; }
        public String getRemovedUserId()  { return removedUserId; }
        public int    getRemainingCount() { return remainingCount; }
        public int    getAcceptedCount()  { return acceptedCount; }
    }
}