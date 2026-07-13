// CandidateProfileDto.java
package syncX.modules.SuperAdmin.Admin_interviews.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class AdminInterviewCandidateDto {
    private UUID candidateId;
    private String firstName;
    private String lastName;
    private String email;
    private String location;
    private String workMode;
    private String dateOfBirth;
    private List<String> skills;
}