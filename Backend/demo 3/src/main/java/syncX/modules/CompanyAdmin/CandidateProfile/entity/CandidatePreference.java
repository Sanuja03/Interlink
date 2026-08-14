package syncX.modules.CompanyAdmin.CandidateProfile.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "CompanyCandidatePreference")
@Table(name = "candidate_preferences")
public class CandidatePreference {

    @Id
    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "expected_salary")
    private Float expectedSalary;

    @Column(name = "years_of_experience")
    private Long yearsOfExperience;

    @Column(name = "\"current_role\"")
    private String currentRole;

    @Column(name = "current_company")
    private String currentCompany;

    @Column(name = "available_start_date")
    private LocalDate availableStartDate;

    @Column(name = "source")
    private String source;

    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }

    public Float getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(Float expectedSalary) { this.expectedSalary = expectedSalary; }

    public Long getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Long yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getCurrentRole() { return currentRole; }
    public void setCurrentRole(String currentRole) { this.currentRole = currentRole; }

    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }

    public LocalDate getAvailableStartDate() { return availableStartDate; }
    public void setAvailableStartDate(LocalDate availableStartDate) { this.availableStartDate = availableStartDate; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}