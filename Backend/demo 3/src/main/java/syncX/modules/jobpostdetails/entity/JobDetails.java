package syncX.modules.jobpostdetails.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import syncX.modules.enums.Category;
import syncX.modules.enums.CategoryConverter;
import syncX.modules.enums.EmploymentType;
import syncX.modules.enums.EmploymentTypeConverter;
import syncX.modules.enums.ExperienceLevel;
import syncX.modules.enums.ExperienceLevelConverter;

@Entity
@Getter
@Setter
@Table(name = "jobs")
public class JobDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String company;
    private String logo;

    @Column(name = "job_location")
    private String location;

    @Convert(converter = EmploymentTypeConverter.class)
    @Column(name = "employment_type")
    private EmploymentType employmentType;

    @Convert(converter = CategoryConverter.class)
    private Category category;

    @Convert(converter = ExperienceLevelConverter.class)
    @Column(name = "experience_level")
    private ExperienceLevel experienceLevel;
    
    @Column(name = "job_title")
    private String title;

    @Column(name = "key_requirements")
    private  String experienceRequired;



    @Column(name = "job_benefits", columnDefinition = "TEXT")
    private String jobBenefits;

    @Column(name = "description", length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", referencedColumnName = "company_id")
    private CompanyDetails companyDetails;
}
