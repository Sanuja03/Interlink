package syncX.modules.CompanyAdmin.job.entity;

import jakarta.persistence.*;

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

    // 🔥 NEW COLUMN (ALREADY ADDED)
    @Column(name = "interview_stages")
    private String interviewStages;

    // 🔥 NEW FIELD (ADDED ONLY)
    @Column(name = "status")
    private String status;

    // 🔥 NEW FIELD (ADDED ONLY)
    @Column(name = "created_date")
    private String createdDate;

    @Column(name = "job_location")
    private String jobLocation;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "vacancies")
    private int vacancies;

    @Column(name = "key_requirements", length = 2000)
    private String keyRequirements;

    @Column(name = "company_id")
    private Long companyId;

    // ================= GETTERS & SETTERS =================

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

    // 🔥 EXISTING
    public String getInterviewStages() { return interviewStages; }
    public void setInterviewStages(String interviewStages) { this.interviewStages = interviewStages; }

    // 🔥 NEW GETTERS & SETTERS
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public int getVacancies() { return vacancies; }
    public void setVacancies(int vacancies) { this.vacancies = vacancies; }

    public String getKeyRequirements() { return keyRequirements; }
    public void setKeyRequirements(String keyRequirements) { this.keyRequirements = keyRequirements; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
}