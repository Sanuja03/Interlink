package syncX.modules.InterviewProcess.InterviewScheduling.dto;

import java.util.List;
import java.util.UUID;

public class InterviewSchedulingDTO {

    // ─────────────────────────────────────────────
    // REQUEST: company admin finalizes the panel
    // ─────────────────────────────────────────────
    public static class FinalizeRequest {
        private UUID requestId;
        private String meetingLink;

        public UUID   getRequestId()   { return requestId; }
        public void   setRequestId(UUID requestId) { this.requestId = requestId; }
        public String getMeetingLink() { return meetingLink; }
        public void   setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    }

    // ─────────────────────────────────────────────
    // REQUEST: save scorecard ID when admin clicks
    //          "Send Scheduled Interview Details"
    // ─────────────────────────────────────────────
    public static class SaveScorecardRequest {
        private UUID scorecardId;   // ← changed from String to UUID

        public UUID getScorecardId() { return scorecardId; }
        public void setScorecardId(UUID scorecardId) { this.scorecardId = scorecardId; }
    }

    // ─────────────────────────────────────────────
    // RESPONSE: returned after finalize or GET
    // ─────────────────────────────────────────────
    public static class ScheduledResponse {
        private String scheduledId;
        private String requestId;
        private String interviewId;
        private String status;
        private short  panelSize;
        private String interviewDate;
        private String interviewTime;
        private String mode;
        private String adminNotes;
        private String meetingLink;
        private UUID   scorecardId;   // ← UUID (matches DB column type)
        private String finalizedAt;
        private List<AcceptedInterviewer> acceptedInterviewers;

        public ScheduledResponse(String scheduledId, String requestId, String interviewId,
                                 String status, short panelSize, String interviewDate,
                                 String interviewTime, String mode, String adminNotes,
                                 String meetingLink, UUID scorecardId, String finalizedAt,
                                 List<AcceptedInterviewer> acceptedInterviewers) {
            this.scheduledId          = scheduledId;
            this.requestId            = requestId;
            this.interviewId          = interviewId;
            this.status               = status;
            this.panelSize            = panelSize;
            this.interviewDate        = interviewDate;
            this.interviewTime        = interviewTime;
            this.mode                 = mode;
            this.adminNotes           = adminNotes;
            this.meetingLink          = meetingLink;
            this.scorecardId          = scorecardId;   // ← UUID
            this.finalizedAt          = finalizedAt;
            this.acceptedInterviewers = acceptedInterviewers;
        }

        public String getScheduledId()   { return scheduledId; }
        public String getRequestId()     { return requestId; }
        public String getInterviewId()   { return interviewId; }
        public String getStatus()        { return status; }
        public short  getPanelSize()     { return panelSize; }
        public String getInterviewDate() { return interviewDate; }
        public String getInterviewTime() { return interviewTime; }
        public String getMode()          { return mode; }
        public String getAdminNotes()    { return adminNotes; }
        public String getMeetingLink()   { return meetingLink; }
        public UUID   getScorecardId()   { return scorecardId; }   // ← returns UUID
        public String getFinalizedAt()   { return finalizedAt; }
        public List<AcceptedInterviewer> getAcceptedInterviewers() { return acceptedInterviewers; }
    }

    // ─────────────────────────────────────────────
    // Each accepted interviewer in the response
    // ─────────────────────────────────────────────
    public static class AcceptedInterviewer {
        private String userId;
        private String fullName;
        private String role;

        public AcceptedInterviewer(String userId, String fullName, String role) {
            this.userId   = userId;
            this.fullName = fullName;
            this.role     = role;
        }

        public String getUserId()   { return userId; }
        public String getFullName() { return fullName; }
        public String getRole()     { return role; }
    }
}