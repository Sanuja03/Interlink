package syncX.modules.questiongenerator.dto;

import lombok.Data;

@Data
public class AnswerSubmissionDTO {
    private Long jobId;
    private String question;
    private String answer;
}
