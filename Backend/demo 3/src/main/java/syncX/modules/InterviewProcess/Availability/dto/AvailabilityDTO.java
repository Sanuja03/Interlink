package syncX.modules.InterviewProcess.Availability.dto;

import java.time.LocalDate;
import java.util.List;

public class AvailabilityDTO {

    // ── Request: interviewer submitting availability ──

    public static class SubmitRequest {
        private String weekKey;
        private String weekStartDate;
        private List<DayEntry> days;

        public String getWeekKey() { return weekKey; }
        public void setWeekKey(String weekKey) { this.weekKey = weekKey; }

        public String getWeekStartDate() { return weekStartDate; }
        public void setWeekStartDate(String weekStartDate) { this.weekStartDate = weekStartDate; }

        public List<DayEntry> getDays() { return days; }
        public void setDays(List<DayEntry> days) { this.days = days; }
    }

    public static class DayEntry {
        private String date;
        private String dayName;

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getDayName() { return dayName; }
        public void setDayName(String dayName) { this.dayName = dayName; }
    }


    // ── Response: status check ──

    public static class StatusResponse {
        private boolean submitted;
        private List<String> availableDays;

        public StatusResponse(boolean submitted, List<String> availableDays) {
            this.submitted = submitted;
            this.availableDays = availableDays;
        }

        public boolean isSubmitted() { return submitted; }
        public List<String> getAvailableDays() { return availableDays; }
    }


    // ── Response: my week availability ──

    public static class MyWeekResponse {
        private String weekKey;
        private String status;
        private List<String> availableDays;

        public MyWeekResponse(String weekKey, String status, List<String> availableDays) {
            this.weekKey = weekKey;
            this.status = status;
            this.availableDays = availableDays;
        }

        public String getWeekKey() { return weekKey; }
        public String getStatus() { return status; }
        public List<String> getAvailableDays() { return availableDays; }
    }


    // ── Response: company admin — interviewer summary for a week ──

    public static class InterviewerWeekSummary {
        private String userId;
        private String interviewerId;
        private String fullName;
        private String role;
        private String branch;
        private String status;
        private List<String> availableDays;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getInterviewerId() { return interviewerId; }
        public void setInterviewerId(String interviewerId) { this.interviewerId = interviewerId; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getBranch() { return branch; }
        public void setBranch(String branch) { this.branch = branch; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public List<String> getAvailableDays() { return availableDays; }
        public void setAvailableDays(List<String> availableDays) { this.availableDays = availableDays; }
    }


    // ── Response: company admin — interviewers available on a specific date ──

    public static class InterviewerDateEntry {
        private String userId;
        private String interviewerId;
        private String fullName;
        private String role;
        private String branch;

        public InterviewerDateEntry(String userId, String interviewerId,
                                    String fullName, String role, String branch) {
            this.userId = userId;
            this.interviewerId = interviewerId;
            this.fullName = fullName;
            this.role = role;
            this.branch = branch;
        }

        public String getUserId() { return userId; }
        public String getInterviewerId() { return interviewerId; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public String getBranch() { return branch; }
    }
}