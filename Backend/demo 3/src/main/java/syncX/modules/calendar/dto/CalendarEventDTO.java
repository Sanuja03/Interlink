package syncX.modules.calendar.dto;

import lombok.Data;

@Data
public class CalendarEventDTO {
    private String interviewId;
    private String jobTitle;
    private String companyName;
    private String date;
    private String time;
    private String endTime;
    private String mode;
    private String meetingLink;
    private String interviewLocation;
    private String status;
    private boolean showGenerateQuestions;
    private boolean showJoinButton;
}
