package syncX.modules.CompanyAdmin.InterviewSummary.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class DecisionRequestDTO {
    private UUID scheduledId;
    private String decision;    // "PASS" or "FAIL"
}