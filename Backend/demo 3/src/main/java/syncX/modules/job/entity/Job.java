package syncX.modules.job.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private double experienceRequired;
    private String educationRequired;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    private List<JobRequirement> requirements;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public double getExperienceRequired() {
        return experienceRequired;
    }

    public void setExperienceRequired(double experienceRequired) {
        this.experienceRequired = experienceRequired;
    }

    public String getEducationRequired() {
        return educationRequired;
    }

    public void setEducationRequired(String educationRequired) {
        this.educationRequired = educationRequired;
    }

    public List<JobRequirement> getRequirements() {
        return requirements;
    }

    public void setRequirements(List<JobRequirement> requirements) {
        this.requirements = requirements;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
