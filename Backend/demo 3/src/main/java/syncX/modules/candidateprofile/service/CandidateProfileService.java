package syncX.modules.candidateprofile.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.candidateprofile.dto.CandidateProfileDTO;
import syncX.modules.candidateprofile.entity.CandidateEducation;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.entity.CandidateResume;
import syncX.modules.candidateprofile.entity.CandidateSkill;
import syncX.modules.candidateprofile.repository.CandidateEducationRepository;
import syncX.modules.candidateprofile.repository.CandidateProfileRepository;
import syncX.modules.candidateprofile.repository.CandidateResumeRepository;
import syncX.modules.candidateprofile.repository.CandidateSkillRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CandidateProfileService {

    @Autowired
    private CandidateProfileRepository profileRepository;

    @Autowired
    private CandidateSkillRepository skillRepository;

    @Autowired
    private CandidateEducationRepository educationRepository;

    @Autowired
    private CandidateResumeRepository resumeRepository;

    @Autowired
    private SupabaseStorageService storageService;

    // ──────────────────────────── GET FULL PROFILE ────────────────────────────

    @Transactional(readOnly = true)
    public CandidateProfileDTO getFullProfile(UUID candidateId) {
        Optional<CandidateProfile> optProfile = profileRepository.findById(candidateId);
        if (optProfile.isEmpty()) return null;

        CandidateProfile profile = optProfile.get();
        CandidateProfileDTO dto = new CandidateProfileDTO();

        dto.setId(profile.getId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setBio(profile.getBio());
        dto.setProfilePictureUrl(profile.getProfilePictureUrl());
        dto.setLocation(profile.getLocation());

        dto.setSkills(skillRepository.findByCandidateId(candidateId));
        dto.setEducation(educationRepository.findByCandidateId(candidateId));
        dto.setResumes(resumeRepository.findByCandidateIdOrderByUploadedAtDesc(candidateId));

        return dto;
    }

    // ──────────────────────────── UPDATE PERSONAL INFO ────────────────────────────

    @Transactional
    public CandidateProfile updateProfile(UUID candidateId, CandidateProfile updatedData) {
        Optional<CandidateProfile> optProfile = profileRepository.findById(candidateId);
        if (optProfile.isEmpty()) throw new RuntimeException("Candidate not found: " + candidateId);

        CandidateProfile existing = optProfile.get();
        if (updatedData.getFirstName() != null) existing.setFirstName(updatedData.getFirstName());
        if (updatedData.getLastName() != null) existing.setLastName(updatedData.getLastName());
        if (updatedData.getPhone() != null) existing.setPhone(updatedData.getPhone());
        if (updatedData.getBio() != null) existing.setBio(updatedData.getBio());
        if (updatedData.getProfilePictureUrl() != null) existing.setProfilePictureUrl(updatedData.getProfilePictureUrl());
        if (updatedData.getLocation() != null) existing.setLocation(updatedData.getLocation());

        return profileRepository.save(existing);
    }

    // ──────────────────────────── SKILLS ────────────────────────────

    @Transactional
    public CandidateSkill addSkill(UUID candidateId, CandidateSkill skill) {
        skill.setCandidateId(candidateId);
        return skillRepository.save(skill);
    }

    @Transactional
    public void deleteSkill(UUID candidateId, Long skillId) {
        skillRepository.deleteByCandidateIdAndId(candidateId, skillId);
    }

    // ──────────────────────────── EDUCATION ────────────────────────────

    @Transactional
    public CandidateEducation addEducation(UUID candidateId, CandidateEducation education) {
        education.setCandidateId(candidateId);
        return educationRepository.save(education);
    }

    @Transactional
    public void deleteEducation(UUID candidateId, Long educationId) {
        educationRepository.deleteByCandidateIdAndId(candidateId, educationId);
    }

    // ──────────────────────────── RESUME UPLOAD ────────────────────────────

    @Transactional
    public CandidateResume uploadResume(UUID candidateId, MultipartFile file) throws Exception {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new Exception("Invalid file: filename is empty");
        }

        // Create a unique filename to avoid collisions: candidateId_timestamp_filename
        String uniqueFileName = candidateId + "_" + System.currentTimeMillis() + "_" + originalFilename;

        // Upload to Supabase cresume bucket
        String publicUrl = storageService.uploadFile(file, uniqueFileName);

        // Save metadata to resume table
        CandidateResume resume = new CandidateResume();
        resume.setCandidateId(candidateId);
        resume.setFileName(originalFilename);
        resume.setFileUrl(publicUrl);
        resume.setUploadedAt(LocalDateTime.now());

        return resumeRepository.save(resume);
    }

    // ──────────────────────────── GET RESUMES ────────────────────────────

    @Transactional(readOnly = true)
    public List<CandidateResume> getResumes(UUID candidateId) {
        return resumeRepository.findByCandidateIdOrderByUploadedAtDesc(candidateId);
    }
}
