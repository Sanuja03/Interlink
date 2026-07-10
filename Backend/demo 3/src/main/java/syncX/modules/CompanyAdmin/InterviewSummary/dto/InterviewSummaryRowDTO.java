package syncX.modules.CompanyAdmin.InterviewSummary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSummaryRowDTO {

    private String scheduledId;
    private String interviewId;
    private String candidateName;
    private String jobTitle;
    private LocalDate interviewDate;
    private LocalTime interviewTime;
    private int currentRound;
    private int totalRounds;
    private String currentStatus;       // null = pending decision, PASS, FAIL

    // One entry per assigned interviewer — null score means not submitted yet
    private List<InterviewerScoreDTO> interviewerScores;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewerScoreDTO {
        private String interviewerName;
        private Integer totalScore;         // null if not submitted
        private Integer maxPossibleScore;   // null if not submitted
        private boolean submitted;
    }
}