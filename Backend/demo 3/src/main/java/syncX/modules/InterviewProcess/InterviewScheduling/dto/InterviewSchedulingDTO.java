package syncX.modules.InterviewProcess.InterviewScheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

public class InterviewSchedulingDTO {

    // REQUEST: company admin finalizes the panel
    @Getter
    @Setter
    @NoArgsConstructor
    public static class FinalizeRequest {
        private UUID   requestId;
        private String meetingLink;
        private String interviewLocation;   // ← Physical venue; null for Online
    }

    // REQUEST: save scorecard ID
    @Getter
    @Setter
    @NoArgsConstructor
    public static class SaveScorecardRequest {
        private UUID scorecardId;
    }

    // RESPONSE: returned after finalize or GET
    @Getter
    @AllArgsConstructor
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
        private String interviewLocation;   // ← Physical venue; null for Online
        private UUID   scorecardId;
        private String finalizedAt;
        private List<AcceptedInterviewer> acceptedInterviewers;
    }

    // Each accepted interviewer in the response
    @Getter
    @AllArgsConstructor
    public static class AcceptedInterviewer {
        private String userId;
        private String fullName;
        private String role;
    }
}