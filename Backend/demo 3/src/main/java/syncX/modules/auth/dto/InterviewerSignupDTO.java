package syncX.modules.auth.dto;
import lombok.Data;

import java.util.UUID;

@Data
public class InterviewerSignupDTO {
    private UUID userId;
    private String fullName;
    private String phone;
    private String email;
    private String InterviewerRole;
    private String branch;



}
