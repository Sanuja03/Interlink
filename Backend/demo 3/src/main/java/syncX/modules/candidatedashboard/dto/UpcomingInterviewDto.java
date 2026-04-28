package syncX.modules.candidatedashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingInterviewDto {
    private UUID scheduledId;
    private String interviewId;
    private String jobTitle;
    private String company;
    private LocalDate date;
    private LocalTime time;
    private String mode;
    private String status;
    private String meetingLink;
}
