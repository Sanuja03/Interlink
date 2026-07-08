package syncX.modules.candidatedashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationTrackerDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String company;
    private LocalDate appliedDate;
    private LocalDate shortlistedDate;
    private LocalDate interviewDate;
    private String status;
    private LocalDate deadline;
    private boolean quizAttempted;
}
