package syncX.modules.CompanyAdmin.profileview.dto;

import java.util.List;

public class CandidateProfileDTO {

    private String fullName;
    private String email;
    private String phone;
    private String location;
    private List<ExperienceDTO> experiences;

    // ✅ GETTERS
    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getLocation() {
        return location;
    }

    public List<ExperienceDTO> getExperiences() {
        return experiences;
    }

    // ✅ SETTERS
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setExperiences(List<ExperienceDTO> experiences) {
        this.experiences = experiences;
    }
}