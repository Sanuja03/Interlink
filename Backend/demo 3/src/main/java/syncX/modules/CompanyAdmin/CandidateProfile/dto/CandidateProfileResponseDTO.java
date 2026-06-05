package syncX.modules.CompanyAdmin.CandidateProfile.dto;

import java.util.List;
import java.util.UUID;

public class CandidateProfileResponseDTO {

    // Basic Info
    private UUID candidateId;
    private String fullName;
    private String email;
    private String phone;
    private String location;
    private String headline;
    private String bio;
    private String profilePictureUrl;
    private String workMode;
    private String joinedDate;

    // Professional Details (from candidate_preferences)
    private Long yearsOfExperience;
    private String currentRole;
    private String currentCompany;
    private Float expectedSalary;
    private String availableStartDate;

    // Skills
    private List<String> skills;

    // Education
    private List<EducationDTO> education;

    // Experience
    private List<ExperienceDTO> experience;

    // Resume
    private String resumeUrl;
    private String resumeFileName;

    // AI Score (from job_applications)
    private Double aiScore;

    // Getters & Setters
    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public Long getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Long yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getCurrentRole() { return currentRole; }
    public void setCurrentRole(String currentRole) { this.currentRole = currentRole; }

    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }

    public Float getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(Float expectedSalary) { this.expectedSalary = expectedSalary; }

    public String getAvailableStartDate() { return availableStartDate; }
    public void setAvailableStartDate(String availableStartDate) { this.availableStartDate = availableStartDate; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<EducationDTO> getEducation() { return education; }
    public void setEducation(List<EducationDTO> education) { this.education = education; }

    public List<ExperienceDTO> getExperience() { return experience; }
    public void setExperience(List<ExperienceDTO> experience) { this.experience = experience; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public Double getAiScore() { return aiScore; }
    public void setAiScore(Double aiScore) { this.aiScore = aiScore; }
}