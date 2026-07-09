package syncX.modules.InterviewProcess.InterviewScheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

public class InterviewerDashboardDTO {


    // Top-level response: stats + today + next
    @Getter
    @AllArgsConstructor
    public static class DashboardResponse {
        private Stats stats;
        private List<TodayRow> todaySchedule;
        private NextInterview nextInterview;     // null if none upcoming
    }


    // Stat counts
    @Getter
    @AllArgsConstructor
    public static class Stats {
        private long scheduled;
        private long pending;
        private long completed;
    }


    // One row in today's schedule table
    @Getter
    @AllArgsConstructor
    public static class TodayRow {
        private String interviewId;
        private String candidate;     // candidate full name
        private String jobTitle;
        private String time;          // formatted "10.30 AM"
        private String mode;          // "Online" / "Physical"
        private String requestId;     // useful for the "View" button
    }


    // The next upcoming interview card payload
    @Getter
    @AllArgsConstructor
    public static class NextInterview {
        private String interviewId;
        private String date;            // "yyyy-MM-dd"
        private String time;            // "10:30 AM"
        private String jobTitle;
        private String meetingLink;     // null for Physical
        private String meetingStatus;   // "CONFIRMED" / "PENDING"
        private String mode;
        private Candidate candidate;
    }


    // Candidate sub-object on NextInterview
    @Getter
    @AllArgsConstructor
    public static class Candidate {
        private String image;          // URL or null → frontend uses default avatar
        private String id;             // candidate id (string form)
        private String name;
        private String cvName;
        private String profileLink;
        private String note;
    }
}