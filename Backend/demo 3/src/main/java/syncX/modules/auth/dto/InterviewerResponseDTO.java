package syncX.modules.auth.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class InterviewerResponseDTO {
    private String interviewerId;
    private UUID userId;
    private UUID companyId;

    private String fullName;
    private String phone;
    private String email;
    private String interviewerRole;
    private String branch;
    private String address;
    private String about;
    private String photoUrl;

    private String accountStatus;
    private boolean isFirstLogin;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}