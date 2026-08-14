package syncX.modules.job.entity;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "department")
    private String department;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "category")
    private String category;

    @Column(name = "interview_rounds")
    private int interviewRounds;

    @Column(name = "job_location")
    private String jobLocation;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "vacancies")
    private int vacancies;

    @Column(name = "interview_stages")
    private String interviewStages;

    @Column(name = "key_requirements", length = 2000)
    private String keyRequirements;

    @Column(name = "status")
    private String status;

    @Column(name = "company_id", columnDefinition = "uuid")
    private UUID companyId;

    @Column(name = "experience_required")
    private double experienceRequired;

    @Column(name = "education_required")
    private String educationRequired;

    @Column(name = "job_benefits")
    private String jobBenefits;

    @Column(name = "deadline")
    private java.time.LocalDate deadline;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobRequirement> requirements;

    //  Auto set created time
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();

        //  ensure default status (fix inconsistency)
        if (this.status == null) {
            this.status = "Open";
        }
    }

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getInterviewRounds() { return interviewRounds; }
    public void setInterviewRounds(int interviewRounds) { this.interviewRounds = interviewRounds; }

    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public int getVacancies() { return vacancies; }
    public void setVacancies(int vacancies) { this.vacancies = vacancies; }

    public String getInterviewStages() { return interviewStages; }
    public void setInterviewStages(String interviewStages) { this.interviewStages = interviewStages; }

    public String getKeyRequirements() { return keyRequirements; }
    public void setKeyRequirements(String keyRequirements) { this.keyRequirements = keyRequirements; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }

    public double getExperienceRequired() { return experienceRequired; }
    public void setExperienceRequired(double experienceRequired) { this.experienceRequired = experienceRequired; }

    public String getEducationRequired() { return educationRequired; }
    public void setEducationRequired(String educationRequired) { this.educationRequired = educationRequired; }

    public String getJobBenefits() { return jobBenefits; }
    public void setJobBenefits(String jobBenefits) { this.jobBenefits = jobBenefits; }

    public java.time.LocalDate getDeadline() { return deadline; }
    public void setDeadline(java.time.LocalDate deadline) { this.deadline = deadline; }

    public List<JobRequirement> getRequirements() { return requirements; }
    public void setRequirements(List<JobRequirement> requirements) { this.requirements = requirements; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}