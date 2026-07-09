package syncX.modules.questiongenerator.dto;

import lombok.Data;
import java.util.List;

@Data
public class EvaluationResultDTO {
    private int score; // legacy compatible field
    private int technicalAccuracy;
    private int coverage;
    private int practicalUnderstanding;
    private int communication;
    private int bestPractices;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingTopics;
    private List<String> recommendations;
    private String feedback;
    private int finalScore;
}
