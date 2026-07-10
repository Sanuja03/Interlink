package syncX.modules.auth.dto;

import lombok.Data;

@Data
public class InterviewerUpdateDTO {
    private String interviewerRole;
    private String branch;
    private String address;
    private String about;
}