package syncX.modules.InterviewProcess.InterviewScheduling.dto;

import java.util.List;

public class InterviewerDashboardDTO {


    // Top-level response: stats + today + next

    public static class DashboardResponse {
        private Stats stats;
        private List<TodayRow> todaySchedule;
        private NextInterview nextInterview;     // null if none upcoming

        public DashboardResponse(Stats stats,
                                 List<TodayRow> todaySchedule,
                                 NextInterview nextInterview) {
            this.stats         = stats;
            this.todaySchedule = todaySchedule;
            this.nextInterview = nextInterview;
        }

        public Stats           getStats()         { return stats; }
        public List<TodayRow>  getTodaySchedule() { return todaySchedule; }
        public NextInterview   getNextInterview() { return nextInterview; }
    }


    // Stat counts

    public static class Stats {
        private long scheduled;
        private long pending;
        private long completed;

        public Stats(long scheduled, long pending, long completed) {
            this.scheduled = scheduled;
            this.pending   = pending;
            this.completed = completed;
        }

        public long getScheduled() { return scheduled; }
        public long getPending()   { return pending; }
        public long getCompleted() { return completed; }
    }


    // One row in today's schedule table

    public static class TodayRow {
        private String interviewId;
        private String candidate;     // candidate full name
        private String jobTitle;
        private String time;          // formatted "10.30 AM"
        private String mode;          // "Online" / "Physical"
        private String requestId;     // useful for the "View" button

        public TodayRow(String interviewId, String candidate, String jobTitle,
                        String time, String mode, String requestId) {
            this.interviewId = interviewId;
            this.candidate   = candidate;
            this.jobTitle    = jobTitle;
            this.time        = time;
            this.mode        = mode;
            this.requestId   = requestId;
        }

        public String getInterviewId() { return interviewId; }
        public String getCandidate()   { return candidate; }
        public String getJobTitle()    { return jobTitle; }
        public String getTime()        { return time; }
        public String getMode()        { return mode; }
        public String getRequestId()   { return requestId; }
    }


    // The next upcoming interview card payload

    public static class NextInterview {
        private String interviewId;
        private String date;            // "yyyy-MM-dd"
        private String time;            // "10:30 AM"
        private String jobTitle;
        private String meetingLink;     // null for Physical
        private String meetingStatus;   // "CONFIRMED" / "PENDING"
        private String mode;
        private Candidate candidate;

        public NextInterview(String interviewId, String date, String time,
                             String jobTitle, String meetingLink,
                             String meetingStatus, String mode, Candidate candidate) {
            this.interviewId   = interviewId;
            this.date          = date;
            this.time          = time;
            this.jobTitle      = jobTitle;
            this.meetingLink   = meetingLink;
            this.meetingStatus = meetingStatus;
            this.mode          = mode;
            this.candidate     = candidate;
        }

        public String    getInterviewId()   { return interviewId; }
        public String    getDate()          { return date; }
        public String    getTime()          { return time; }
        public String    getJobTitle()      { return jobTitle; }
        public String    getMeetingLink()   { return meetingLink; }
        public String    getMeetingStatus() { return meetingStatus; }
        public String    getMode()          { return mode; }
        public Candidate getCandidate()     { return candidate; }
    }


    // Candidate sub-object on NextInterview

    public static class Candidate {
        private String image;          // URL or null → frontend uses default avatar
        private String id;             // candidate id (string form)
        private String name;
        private String cvName;
        private String profileLink;
        private String note;

        public Candidate(String image, String id, String name, String cvName,
                         String profileLink, String note) {
            this.image       = image;
            this.id          = id;
            this.name        = name;
            this.cvName      = cvName;
            this.profileLink = profileLink;
            this.note        = note;
        }

        public String getImage()       { return image; }
        public String getId()          { return id; }
        public String getName()        { return name; }
        public String getCvName()      { return cvName; }
        public String getProfileLink() { return profileLink; }
        public String getNote()        { return note; }
    }
}