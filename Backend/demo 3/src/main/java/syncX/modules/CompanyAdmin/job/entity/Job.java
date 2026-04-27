package syncX.modules.CompanyAdmin.job.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_title")
    private String jobTitle;

    private String department;

    @Column(name = "employment_type")
    private String employmentType;

    private String category;

    @Column(name = "interview_rounds")
    private int interviewRounds;

    @Column(name = "job_location")
    private String jobLocation;

    @Column(name = "experience_level")
    private String experienceLevel;

    private int vacancies;

    @Column(name = "key_requirements", length = 2000)
    private String keyRequirements;

    /**
     * companyId is a UUID in the database (jobs.company_id is of type uuid).
     * Previously this was declared as Long, which caused
     *   "Bad value for type long : <uuid>"
     * whenever Hibernate tried to load any job that had company_id populated.
     */
    @Column(name = "company_id")
    private UUID companyId;

    // ── GETTERS AND SETTERS ───────────────────────────────────────

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

    public String getKeyRequirements() { return keyRequirements; }
    public void setKeyRequirements(String keyRequirements) { this.keyRequirements = keyRequirements; }

    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }
}