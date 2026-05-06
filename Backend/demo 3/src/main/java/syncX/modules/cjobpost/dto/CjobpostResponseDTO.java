package syncX.modules.cjobpost.dto;

import lombok.Getter;
import lombok.Setter;
import syncX.modules.enums.Category;
import syncX.modules.enums.EmploymentType;
import syncX.modules.enums.ExperienceLevel;

import java.time.LocalDate;

@Getter
@Setter
public class CjobpostResponseDTO {
    private Long id;
    private String company;
    private String logo;
    private String location;
    private EmploymentType employmentType;
    private Category category;
    private ExperienceLevel experienceLevel;
    private String title;
    private String aboutCompany;
    private String description;
    private LocalDate deadline;
}
