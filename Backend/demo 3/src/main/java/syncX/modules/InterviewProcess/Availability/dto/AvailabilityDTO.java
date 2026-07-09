package syncX.modules.InterviewProcess.Availability.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AvailabilityDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitRequest {
        private String weekKey;
        private String weekStartDate;
        private List<DayEntry> days;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayEntry {
        private String date;
        private String dayName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusResponse {
        private boolean submitted;
        private List<String> availableDays;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MyWeekResponse {
        private String weekKey;
        private String status;
        private List<String> availableDays;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewerWeekSummary {
        private String userId;
        private String interviewerId;
        private String fullName;
        private String role;
        private String branch;
        private String status;
        private List<String> availableDays;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewerDateEntry {
        private String userId;
        private String interviewerId;
        private String fullName;
        private String role;
        private String branch;
    }
}