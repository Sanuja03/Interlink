package syncX.modules.candidateprofile.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.candidateprofile.dto.CandidateProfileDTO;
import syncX.modules.candidateprofile.dto.UpdateProfileRequest;
import syncX.modules.candidateprofile.entity.CandidateEducation;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.entity.CandidateResume;
import syncX.modules.candidateprofile.entity.CandidateSkill;
import syncX.modules.candidateprofile.entity.CandidateExperience;
import syncX.modules.candidateprofile.repository.CandidateEducationRepository;
import syncX.modules.candidateprofile.repository.CandidateExperienceRepository;
import syncX.modules.candidateprofile.repository.CandidateProfileRepository;
import syncX.modules.candidateprofile.repository.CandidateResumeRepository;
import syncX.modules.candidateprofile.repository.CandidateSkillRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CandidateProfileService {

    // Must match SupabaseStorageService constants exactly
    private static final String RESUME_BUCKET  = "c_resume";
    private static final String PICTURE_BUCKET = "cprofile_picture";
    private static final String ENCODED_PICTURE_BUCKET = "cprofile_picture";
    private static final String ENCODED_RESUME_BUCKET  = "c_resume";

    @Autowired private CandidateProfileRepository profileRepository;
    @Autowired private CandidateSkillRepository skillRepository;
    @Autowired private CandidateEducationRepository educationRepository;
    @Autowired private CandidateExperienceRepository experienceRepository;
    @Autowired private CandidateResumeRepository resumeRepository;
    @Autowired private SupabaseStorageService storageService;

    // ──────────────────────────────────── GET PROFILE ────────────────────────────────────

    @Transactional
    public CandidateProfileDTO getFullProfile(UUID userId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUserId(userId);
                    return profileRepository.save(newProfile);
                });

        UUID internalId = profile.getId();
        CandidateProfileDTO dto = new CandidateProfileDTO();

        dto.setId(internalId);
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setBio(profile.getBio());
        dto.setProfilePictureUrl(profile.getProfilePictureUrl());
        dto.setLocation(profile.getLocation());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setHeadline(profile.getHeadline());

        dto.setSkills(skillRepository.findByCandidateId(internalId));
        dto.setEducation(educationRepository.findByCandidateId(internalId));
        dto.setExperiences(experienceRepository.findByCandidateId(internalId));
        dto.setResumes(resumeRepository.findByCandidateIdOrderByUploadedAtDesc(internalId));

        return dto;
    }

    // ──────────────────────────────── UPDATE PERSONAL INFO ───────────────────────────────

    /**
     * Patch-updates profile fields. Only non-null values in the request are applied.
     */
    @Transactional
    public CandidateProfile updateProfile(UUID userId, UpdateProfileRequest req) {
        CandidateProfile existing = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUserId(userId);
                    return newProfile;
                });

        if (req.getFirstName() != null && !req.getFirstName().isBlank()) {
            existing.setFirstName(req.getFirstName().trim());
        }
        if (req.getLastName() != null && !req.getLastName().isBlank()) {
            existing.setLastName(req.getLastName().trim());
        }
        if (req.getPhone() != null) {
            existing.setPhone(req.getPhone().trim().isEmpty() ? null : req.getPhone().trim());
        }
        if (req.getBio() != null) {
            existing.setBio(req.getBio().trim().isEmpty() ? null : req.getBio().trim());
        }
        if (req.getLocation() != null) {
            existing.setLocation(req.getLocation().trim().isEmpty() ? null : req.getLocation().trim());
        }
        if (req.getDateOfBirth() != null) {
            existing.setDateOfBirth(req.getDateOfBirth());
        }
        if (req.getHeadline() != null) {
            existing.setHeadline(req.getHeadline().trim().isEmpty() ? null : req.getHeadline().trim());
        }

        return profileRepository.save(existing);
    }

    // ──────────────────────────────── PROFILE PICTURE UPLOAD ─────────────────────────────

    /**
     * Uploads a new profile picture, deletes the previous one from storage,
     * and updates the candidate's profilePictureUrl.
     */
    @Transactional
    public String uploadProfilePicture(UUID userId, MultipartFile file) throws Exception {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUserId(userId);
                    return profileRepository.save(newProfile);
                });

        // Delete old picture from Supabase storage if one exists
        String oldUrl = profile.getProfilePictureUrl();
        if (oldUrl != null && !oldUrl.isBlank()) {
            // URL has encoded bucket name, extract the filename part after it
            String oldFileName = extractFileNameFromUrl(oldUrl, ENCODED_PICTURE_BUCKET);
            if (oldFileName != null) {
                storageService.deleteFile(PICTURE_BUCKET, oldFileName);
            }
        }

        // Upload new picture
        String ext = getExtension(file.getOriginalFilename());
        String uniqueFileName = "profile_" + profile.getId() + "_" + System.currentTimeMillis() + ext;
        String publicUrl = storageService.uploadProfilePicture(file, uniqueFileName);

        // Persist URL
        profile.setProfilePictureUrl(publicUrl);
        profileRepository.save(profile);

        return publicUrl;
    }

    // ────────────────────────────────────── SKILLS ───────────────────────────────────────

    /**
     * Replaces all existing skills for a candidate with the provided list.
     */
    @Transactional
    public List<CandidateSkill> replaceSkills(UUID userId, List<String> skillNames) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUserId(userId);
                    return profileRepository.save(newProfile);
                });
        UUID internalId = profile.getId();

        // Validate skill names
        if (skillNames == null) throw new IllegalArgumentException("Skills list must not be null");
        for (String name : skillNames) {
            if (name == null || name.isBlank()) {
                throw new IllegalArgumentException("Skill name must not be blank");
            }
            if (name.length() > 50) {
                throw new IllegalArgumentException("Each skill name must be 50 characters or fewer");
            }
        }

        // Delete all current skills for this candidate
        skillRepository.deleteByCandidateId(internalId);

        // Insert the new list
        List<CandidateSkill> newSkills = skillNames.stream().map(name -> {
            CandidateSkill s = new CandidateSkill();
            s.setCandidateId(internalId);
            s.setSkillName(name.trim());
            return s;
        }).toList();

        return skillRepository.saveAll(newSkills);
    }

    // ──────────────────────────────────── EDUCATION ──────────────────────────────────────

    @Transactional
    public CandidateEducation addEducation(UUID userId, CandidateEducation education) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUserId(userId);
                    return profileRepository.save(newProfile);
                });
        UUID internalId = profile.getId();

        if (education.getDegree() == null || education.getDegree().isBlank()) {
            throw new IllegalArgumentException("Degree must not be blank");
        }
        if (education.getInstitution() == null || education.getInstitution().isBlank()) {
            throw new IllegalArgumentException("Institution must not be blank");
        }
        if (education.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        // endDate is optional (currently studying)
        education.setCandidateId(internalId);
        return educationRepository.save(education);
    }

    @Transactional
    public void deleteEducation(UUID userId, Long educationId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        educationRepository.deleteByCandidateIdAndId(profile.getId(), educationId);
    }

    // ──────────────────────────────────── EXPERIENCE ─────────────────────────────────────

    @Transactional
    public CandidateExperience addExperience(UUID userId, CandidateExperience experience) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUserId(userId);
                    return profileRepository.save(newProfile);
                });
        UUID internalId = profile.getId();

        if (experience.getCcompanyName() == null || experience.getCcompanyName().isBlank()) {
            throw new IllegalArgumentException("Company name must not be blank");
        }
        if (experience.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        experience.setCandidateId(internalId);
        return experienceRepository.save(experience);
    }

    @Transactional
    public void deleteExperience(UUID userId, Long experienceId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        experienceRepository.deleteByCandidateIdAndId(profile.getId(), experienceId);
    }

    // ────────────────────────────────────── RESUME ───────────────────────────────────────

    /**
     * Validates, uploads a CV to Supabase storage, and saves metadata to DB.
     */
    @Transactional
    public CandidateResume uploadResume(UUID userId, MultipartFile file) throws Exception {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUserId(userId);
                    return profileRepository.save(newProfile);
                });
        UUID internalId = profile.getId();

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new Exception("Invalid file: filename is empty");
        }

        // Delete any existing CVs from DB and storage to ensure candidate has only one CV at a time
        List<CandidateResume> existingResumes = resumeRepository.findByCandidateIdOrderByUploadedAtDesc(internalId);
        for (CandidateResume oldResume : existingResumes) {
            String oldFileName = extractFileNameFromUrl(oldResume.getFileUrl(), ENCODED_RESUME_BUCKET);
            if (oldFileName != null) {
                try {
                    storageService.deleteFile(RESUME_BUCKET, oldFileName);
                } catch (Exception e) {
                    // ignore storage deletion warnings to ensure DB cleanup succeeds
                }
            }
            resumeRepository.delete(oldResume);
        }

        String uniqueFileName = "cv_" + internalId + "_" + System.currentTimeMillis() + "_" + originalFilename;
        String publicUrl = storageService.uploadResume(file, uniqueFileName);

        CandidateResume resume = new CandidateResume();
        resume.setCandidateId(internalId);
        resume.setFileName(originalFilename);
        resume.setFileUrl(publicUrl);
        resume.setUploadedAt(LocalDateTime.now());

        return resumeRepository.save(resume);
    }

    /**
     * Deletes a resume from DB and from Supabase storage.
     */
    @Transactional
    public void deleteResume(UUID userId, Long resumeId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        UUID internalId = profile.getId();

        CandidateResume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));

        if (!resume.getCandidateId().equals(internalId)) {
            throw new SecurityException("You do not have permission to delete this resume");
        }

        // Delete from Supabase storage
        String fileName = extractFileNameFromUrl(resume.getFileUrl(), ENCODED_RESUME_BUCKET);
        if (fileName != null) {
            storageService.deleteFile(RESUME_BUCKET, fileName);
        }

        resumeRepository.deleteById(resumeId);
    }

    @Transactional(readOnly = true)
    public List<CandidateResume> getResumes(UUID userId) {
        Optional<CandidateProfile> profile = profileRepository.findByUserId(userId);
        if (profile.isEmpty()) {
            return List.of();
        }
        return resumeRepository.findByCandidateIdOrderByUploadedAtDesc(profile.get().getId());
    }

    // ────────────────────────────────────── UTILS ────────────────────────────────────────

    /**
     * Extracts the filename from a Supabase public URL.
     * The bucket name in the URL may be URL-encoded (spaces → %20).
     * Example URL: https://xxx.supabase.co/storage/v1/object/public/c_resume/cv_abc.pdf
     * Example URL: https://xxx.supabase.co/storage/v1/object/public/candidate%20profile%20picture/profile_abc.jpg
     */
    private String extractFileNameFromUrl(String url, String encodedBucket) {
        if (url == null) return null;
        String marker = "/public/" + encodedBucket + "/";
        int idx = url.indexOf(marker);
        if (idx >= 0) {
            return url.substring(idx + marker.length());
        }
        return null;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
