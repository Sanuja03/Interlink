package syncX.modules.InterviewProcess.InterviewRequest.dto;

import java.util.List;
import java.util.UUID;

public class InterviewRequestDTO {


    // REQUEST: admin creates an interview request

    public static class CreateRequest {
        private UUID candidateId;
        private Long jobApplicationId;
        private Long jobId;
        private Long historyId;   // ← bigint, from candidate_history.history_id
        private short panelSize;
        private String interviewDate;
        private String interviewTime;
        private String mode;
        private String adminNotes;
        private List<UUID> interviewerUserIds;

        public UUID getCandidateId() { return candidateId; }
        public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }

        public Long getJobApplicationId() { return jobApplicationId; }
        public void setJobApplicationId(Long jobApplicationId) { this.jobApplicationId = jobApplicationId; }

        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }

        public Long getHistoryId() { return historyId; }
        public void setHistoryId(Long historyId) { this.historyId = historyId; }

        public short getPanelSize() { return panelSize; }
        public void setPanelSize(short panelSize) { this.panelSize = panelSize; }

        public String getInterviewDate() { return interviewDate; }
        public void setInterviewDate(String interviewDate) { this.interviewDate = interviewDate; }

        public String getInterviewTime() { return interviewTime; }
        public void setInterviewTime(String interviewTime) { this.interviewTime = interviewTime; }

        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }

        public String getAdminNotes() { return adminNotes; }
        public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

        public List<UUID> getInterviewerUserIds() { return interviewerUserIds; }
        public void setInterviewerUserIds(List<UUID> interviewerUserIds) {
            this.interviewerUserIds = interviewerUserIds;
        }
    }


    // RESPONSE: interviewer option for the picker

    public static class InterviewerOption {
        private String userId;
        private String interviewerId;
        private String fullName;
        private String role;
        private String branch;
        private boolean available;

        public InterviewerOption(String userId, String interviewerId, String fullName,
                                 String role, String branch, boolean available) {
            this.userId = userId;
            this.interviewerId = interviewerId;
            this.fullName = fullName;
            this.role = role;
            this.branch = branch;
            this.available = available;
        }

        public String getUserId() { return userId; }
        public String getInterviewerId() { return interviewerId; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public String getBranch() { return branch; }
        public boolean isAvailable() { return available; }
    }

    public static class AssignableInterviewersResponse {
        private List<InterviewerOption> available;
        private List<InterviewerOption> other;

        public AssignableInterviewersResponse(List<InterviewerOption> available,
                                              List<InterviewerOption> other) {
            this.available = available;
            this.other = other;
        }

        public List<InterviewerOption> getAvailable() { return available; }
        public List<InterviewerOption> getOther() { return other; }
    }


    // RESPONSE: after creating a request

    public static class CreateResponse {
        private String requestId;
        private String interviewId;
        private String status;
        private List<String> invitedInterviewerUserIds;

        public CreateResponse(String requestId, String interviewId, String status,
                              List<String> invitedInterviewerUserIds) {
            this.requestId = requestId;
            this.interviewId = interviewId;
            this.status = status;
            this.invitedInterviewerUserIds = invitedInterviewerUserIds;
        }

        public String getRequestId() { return requestId; }
        public String getInterviewId() { return interviewId; }
        public String getStatus() { return status; }
        public List<String> getInvitedInterviewerUserIds() { return invitedInterviewerUserIds; }
    }


    // RESPONSE: existing request (for popup pre-fill)

    public static class InvitedInterviewer {
        private String userId;
        private String fullName;
        private String role;
        private String responseStatus;

        public InvitedInterviewer(String userId, String fullName, String role, String responseStatus) {
            this.userId = userId;
            this.fullName = fullName;
            this.role = role;
            this.responseStatus = responseStatus;
        }

        public String getUserId() { return userId; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public String getResponseStatus() { return responseStatus; }
    }

    public static class ExistingRequestResponse {
        private String requestId;
        private String interviewId;
        private String status;
        private short panelSize;
        private String interviewDate;
        private String interviewTime;
        private String mode;
        private String adminNotes;
        private Long historyId;   // ← bigint, plain number in the JSON
        private List<InvitedInterviewer> invitedInterviewers;

        public ExistingRequestResponse(String requestId, String interviewId, String status,
                                       short panelSize, String interviewDate, String interviewTime,
                                       String mode, String adminNotes, Long historyId,
                                       List<InvitedInterviewer> invitedInterviewers) {
            this.requestId = requestId;
            this.interviewId = interviewId;
            this.status = status;
            this.panelSize = panelSize;
            this.interviewDate = interviewDate;
            this.interviewTime = interviewTime;
            this.mode = mode;
            this.adminNotes = adminNotes;
            this.historyId = historyId;
            this.invitedInterviewers = invitedInterviewers;
        }

        public String getRequestId() { return requestId; }
        public String getInterviewId() { return interviewId; }
        public String getStatus() { return status; }
        public short getPanelSize() { return panelSize; }
        public String getInterviewDate() { return interviewDate; }
        public String getInterviewTime() { return interviewTime; }
        public String getMode() { return mode; }
        public String getAdminNotes() { return adminNotes; }
        public Long getHistoryId() { return historyId; }
        public List<InvitedInterviewer> getInvitedInterviewers() { return invitedInterviewers; }
    }


// RESPONSE: pending request as seen by an interviewer

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

        public PendingRequestForInterviewer(String interviewId, String requestId,
                                            String candidateName, String jobTitle,
                                            String interviewDate, String interviewTime,
                                            String mode, String adminNotes, Long historyId) {
            this.interviewId = interviewId;
            this.requestId = requestId;
            this.candidateName = candidateName;
            this.jobTitle = jobTitle;
            this.interviewDate = interviewDate;
            this.interviewTime = interviewTime;
            this.mode = mode;
            this.adminNotes = adminNotes;
            this.historyId = historyId;
        }

        public String getInterviewId() { return interviewId; }
        public String getRequestId() { return requestId; }
        public String getCandidateName() { return candidateName; }
        public String getJobTitle() { return jobTitle; }
        public String getInterviewDate() { return interviewDate; }
        public String getInterviewTime() { return interviewTime; }
        public String getMode() { return mode; }
        public String getAdminNotes() { return adminNotes; }
        public Long getHistoryId() { return historyId; }
    }


// REQUEST: interviewer responds (accept/decline)

    public static class RespondRequest {
        private String response; // "accepted" or "declined"

        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
    }
}