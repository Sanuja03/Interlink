package syncX.modules.InterviewProcess.InterviewRequest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Minimal response DTO for the currently authenticated company admin.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyMeResponse {
    private String companyId;
    private String companyName;
    private String companyEmail;
}