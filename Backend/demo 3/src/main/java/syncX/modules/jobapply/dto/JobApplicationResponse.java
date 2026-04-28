package syncX.modules.jobapply.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Full response returned after submitting or fetching a job application.
 */
@Data
public class JobApplicationResponse {
    private Long id;
    private UUID candidateId;
    private Long jobId;
    private String jobTitle;
    private String company;
    private String candidateName;
    private String resumeUrl;
    private String status;
    private String coverLetter;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String linkedinUrl;
    private String portfolioUrl;
    private LocalDate appliedDate;
    private LocalDate interviewDate;
    private LocalDate shortlistedDate;
    private String result;
    private Double score;
}
