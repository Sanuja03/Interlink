package syncX.modules.cjobpost.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;
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
public class Cjobpost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String company;
    private String logo;

    @Column(name = "job_location")
    private String location;

    @JsonManagedReference
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<JobRequirement> requirements;
    
    @Convert(converter = EmploymentTypeConverter.class)
    private EmploymentType employmentType;

    @Convert(converter = CategoryConverter.class)
    private Category category;

    @Convert(converter = ExperienceLevelConverter.class)
    private ExperienceLevel experienceLevel;
    
    @Column(name = "job_title")
    private String title;

    @Column(length = 2000)
    private String aboutCompany;

    @Column(length = 2000)
    private String description;

    @Column(name = "`Deadline`")
    private LocalDate deadline;

//    @ElementCollection
//    @CollectionTable(name = "cjobpost_requirements", joinColumns = @JoinColumn(name = "jobpost_id"))
//    @Column(name = "requirement", length = 500)
//    private List<String> requirements;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "cjobpost_benefits", joinColumns = @JoinColumn(name = "jobpost_id"))
    @Column(name = "benefit", length = 500)
    private List<String> benefits;
}
