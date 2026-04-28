package syncX.modules.candidateprofile.dto;

import lombok.Data;
import syncX.modules.candidateprofile.entity.CandidateEducation;
import syncX.modules.candidateprofile.entity.CandidateResume;
import syncX.modules.candidateprofile.entity.CandidateSkill;

import java.util.List;
import java.util.UUID;

@Data
public class CandidateProfileDTO {

    // Personal Info
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String bio;
    private String profilePictureUrl;
    private String location;
    private java.time.LocalDate dateOfBirth;
    private String headline;

    // Skills
    private List<CandidateSkill> skills;

    // Education
    private List<CandidateEducation> education;

    // Resumes
    private List<CandidateResume> resumes;

    // Experience
    private List<syncX.modules.candidateprofile.entity.CandidateExperience> experiences;
}
