package syncX.modules.jobapply.dto;

import lombok.Data;

/**
 * Request payload sent by the candidate when submitting a job application.
 * The resume file is sent as a separate multipart field.
 * All fields here are optional — they supplement the pre-filled candidate data.
 */
@Data
public class JobApplicationRequest {

    // Required
    private Long jobId;

    // Optional supplementary fields (override or fill gaps from candidates table)
    private String coverLetter;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String linkedinUrl;
    private String portfolioUrl;
    private String githubUrl;
    private Integer yearsOfExperience;
    private String currentRole;
    private String currentCompany;
    private Double expectedSalary;
    private java.time.LocalDate availableStartDate;
    private String source;
}
