package syncX.modules.auth.dto;
import lombok.Data;

import java.util.UUID;
//these are wat coming from front end
@Data
public class InterviewerSignupDTO {
    private String interviewerId;//eid

    private String fullName;
    private String phone;
    private String email;

    private String InterviewerRole;
    private String branch;
    private String about;
    private String address;

    private String password;



}
