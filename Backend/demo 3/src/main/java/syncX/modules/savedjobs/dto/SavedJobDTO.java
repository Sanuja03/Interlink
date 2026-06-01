package syncX.modules.savedjobs.dto;

import lombok.Data;
import syncX.modules.enums.Category;
import syncX.modules.enums.EmploymentType;
import syncX.modules.enums.ExperienceLevel;

import java.time.LocalDateTime;

@Data
public class SavedJobDTO {
    private Long id; // Saved job entry ID
    private Long jobId;
    private String title;
    private String company;
    private String logo;
    private String location;
    private EmploymentType employmentType;
    private Category category;
    private ExperienceLevel experienceLevel;
    private LocalDateTime savedAt;
}
