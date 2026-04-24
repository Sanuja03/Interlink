package syncX.modules.jobpostdetails.dto;

import lombok.Data;
import syncX.modules.enums.Category;
import syncX.modules.enums.EmploymentType;
import syncX.modules.enums.ExperienceLevel;

import java.util.UUID;

@Data
public class JobPostDetailsDTO {
    private Long id;
    private String company;
    private String logo;
    private String location;
    private EmploymentType employmentType;
    private Category category;
    private ExperienceLevel experienceLevel;
    private String title;
    private String experienceRequired;
    private String jobBenefits;
    private String description;
    
    // Fields from CompanyDetails
    private UUID companyId;
    private String companyName;
    private String companyDescription;
}
