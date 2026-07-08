package syncX.modules.questiongenerator.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaveScoreDTO {
    private Long jobId;
    private List<String> questions;
    private List<String> answers;
    private int score;
}
