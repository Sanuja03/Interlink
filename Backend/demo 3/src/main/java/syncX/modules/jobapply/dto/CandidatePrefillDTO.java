package syncX.modules.jobapply.dto;

import lombok.Data;

/**
 * Pre-fill DTO returned to the frontend before the candidate fills in the application form.
 * Populated from the candidates table using the authenticated user's ID.
 */
@Data
public class CandidatePrefillDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String location;
    private String bio;
    private String headline;
    private String profilePictureUrl;
    // Extra fields from the candidates table that may be useful for the form
    private String linkedinUrl;
    private String portfolioUrl;
    private String githubUrl;
    private String currentRole;
    private String currentCompany;
    private Integer yearsOfExperience;
    private Double expectedSalary;
    
    // Autofilled CV details
    private String resumeUrl;
    private String resumeFileName;
}
