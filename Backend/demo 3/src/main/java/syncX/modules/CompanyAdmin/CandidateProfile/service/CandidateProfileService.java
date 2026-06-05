package syncX.modules.CompanyAdmin.CandidateProfile.service;

import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.CandidateProfile.dto.*;
import syncX.modules.CompanyAdmin.CandidateProfile.entity.*;
import syncX.modules.CompanyAdmin.CandidateProfile.repository.*;
import syncX.modules.auth.entity.Candidate;
import syncX.modules.auth.repository.CandidateRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;
import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationRepository;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CandidateProfileService {

    private final CandidateRepository candidateRepository;
    private final CandidateSkillRepository skillRepository;
    private final CandidatePreferenceRepository preferenceRepository;
    private final CandidateEducationRepository educationRepository;
    private final CandidateExperienceRepository experienceRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationRepository applicationRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM yyyy");
    private static final DateTimeFormatter JOINED_FORMAT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    public CandidateProfileService(
            CandidateRepository candidateRepository,
            CandidateSkillRepository skillRepository,
            CandidatePreferenceRepository preferenceRepository,
            CandidateEducationRepository educationRepository,
            CandidateExperienceRepository experienceRepository,
            ResumeRepository resumeRepository,
            ApplicationRepository applicationRepository) {
        this.candidateRepository = candidateRepository;
        this.skillRepository = skillRepository;
        this.preferenceRepository = preferenceRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.resumeRepository = resumeRepository;
        this.applicationRepository = applicationRepository;
    }

    public CandidateProfileResponseDTO getCandidateProfile(UUID candidateId, Long applicationId) {

        // 1. Get basic candidate info
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        CandidateProfileResponseDTO dto = new CandidateProfileResponseDTO();
        dto.setCandidateId(candidate.getCandidateId());
        dto.setFullName(candidate.getFirstName() + " " + candidate.getLastName());
        dto.setEmail(candidate.getEmail());
        dto.setPhone(candidate.getPhone());
        dto.setLocation(candidate.getLocation());
        dto.setHeadline(candidate.getHeadline());
        dto.setBio(candidate.getBio());
        dto.setProfilePictureUrl(candidate.getProfilePictureUrl());
        dto.setWorkMode(candidate.getWorkMode());

        if (candidate.getCreatedAt() != null) {
            dto.setJoinedDate(candidate.getCreatedAt().format(JOINED_FORMAT));
        }

        // 2. Get skills
        List<CandidateSkill> skills = skillRepository.findByCandidateId(candidateId);
        List<String> skillList = skills.stream()
                .map(CandidateSkill::getSkills)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        dto.setSkills(skillList);

        // 3. Get preferences
        preferenceRepository.findByCandidateId(candidateId).ifPresent(pref -> {
            dto.setYearsOfExperience(pref.getYearsOfExperience());
            dto.setCurrentRole(pref.getCurrentRole());
            dto.setCurrentCompany(pref.getCurrentCompany());
            dto.setExpectedSalary(pref.getExpectedSalary());
            if (pref.getAvailableStartDate() != null) {
                dto.setAvailableStartDate(pref.getAvailableStartDate().toString());
            }
        });

        // 4. Get education
        List<CandidateEducation> educations = educationRepository.findByCandidateId(candidateId);
        List<EducationDTO> educationDTOs = educations.stream().map(edu -> {
            EducationDTO edDto = new EducationDTO();
            edDto.setDegree(edu.getDegree());
            edDto.setInstitution(edu.getInstitution());
            if (edu.getStartDate() != null) edDto.setStartDate(edu.getStartDate().toString());
            if (edu.getEndDate() != null) edDto.setEndDate(edu.getEndDate().toString());
            return edDto;
        }).collect(Collectors.toList());
        dto.setEducation(educationDTOs);

        // 5. Get experience
        List<CandidateExperience> experiences =
                experienceRepository.findByCandidateIdOrderByStartDateDesc(candidateId);
        List<ExperienceDTO> experienceDTOs = experiences.stream().map(exp -> {
            ExperienceDTO exDto = new ExperienceDTO();
            exDto.setJobTitle(exp.getJobTitle());
            exDto.setCompanyName(exp.getCompanyName());
            exDto.setDescription(exp.getDescription());
            if (exp.getStartDate() != null) exDto.setStartDate(exp.getStartDate().format(DATE_FORMAT));
            if (exp.getEndDate() != null) {
                exDto.setEndDate(exp.getEndDate().format(DATE_FORMAT));
            } else {
                exDto.setEndDate("Present");
            }
            return exDto;
        }).collect(Collectors.toList());
        dto.setExperience(experienceDTOs);

        // 6. Get resume
        List<Resume> resumes = resumeRepository.findByCandidateId(candidateId);
        if (!resumes.isEmpty()) {
            Resume latestResume = resumes.get(resumes.size() - 1);
            dto.setResumeUrl(latestResume.getFileUrl());
            dto.setResumeFileName(latestResume.getFileName());
        }

        // 7. Get AI score from the specific application
        if (applicationId != null) {
            applicationRepository.findById(applicationId).ifPresent(app -> {
                dto.setAiScore(app.getScore());
            });
        }

        return dto;
    }
}