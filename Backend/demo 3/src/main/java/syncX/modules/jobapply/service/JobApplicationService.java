package syncX.modules.jobapply.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.repository.CandidateProfileRepository;
import syncX.modules.jobapply.dto.CandidatePrefillDTO;
import syncX.modules.jobapply.dto.JobApplicationRequest;
import syncX.modules.jobapply.dto.JobApplicationResponse;
import syncX.modules.candidatedashboard.entity.JobApplication;
import syncX.modules.candidatedashboard.repository.JobApplicationRepository;

import syncX.modules.jobpostdetails.entity.JobDetails;
import syncX.modules.jobpostdetails.repository.JobDetailsRepository;

import syncX.modules.jobapply.entity.CandidatePreference;
import syncX.modules.jobapply.repository.CandidatePreferenceRepository;
import syncX.modules.candidateprofile.entity.CandidateResume;
import syncX.modules.candidateprofile.repository.CandidateResumeRepository;
import syncX.modules.candidateprofile.service.SupabaseStorageService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Core business logic for the job application feature.
 * All methods accept the Supabase user_id from the JWT 'sub' claim.
 */
@Service
public class JobApplicationService {

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private CandidatePreferenceRepository candidatePreferenceRepository;

    @Autowired
    private JobApplicationStorageService storageService;

    @Autowired
    private JobDetailsRepository jobDetailsRepository;

    @Autowired
    private CandidateResumeRepository resumeRepository;

    @Autowired
    private SupabaseStorageService profileStorageService;

    @PersistenceContext
    private EntityManager entityManager;

    // ── PRE-FILL ──────────────────────────────────────────────────────────────────

    /**
     * Returns candidate data from the candidates table for pre-filling the application form.
     * If the candidate has no profile row yet, returns an empty DTO (they must fill manually).
     */
    public CandidatePrefillDTO getPrefillData(UUID userId) {
        CandidatePrefillDTO dto = new CandidatePrefillDTO();
        candidateProfileRepository.findByUserId(userId).ifPresent(profile -> {
            dto.setFirstName(profile.getFirstName());
            dto.setLastName(profile.getLastName());
            dto.setEmail(profile.getEmail());
            dto.setPhone(profile.getPhone());
            dto.setLocation(profile.getLocation());
            dto.setBio(profile.getBio());
            dto.setHeadline(profile.getHeadline());
            dto.setProfilePictureUrl(profile.getProfilePictureUrl());
            
            // Autofill CV details
            List<CandidateResume> resumes = resumeRepository.findByCandidateIdOrderByUploadedAtDesc(profile.getId());
            if (!resumes.isEmpty()) {
                CandidateResume cv = resumes.get(0);
                dto.setResumeUrl(cv.getFileUrl());
                dto.setResumeFileName(cv.getFileName());
            }
            
            candidatePreferenceRepository.findById(profile.getId()).ifPresent(pref -> {
                dto.setYearsOfExperience(pref.getYearsOfExperience());
                dto.setCurrentRole(pref.getCurrentRole());
                dto.setCurrentCompany(pref.getCurrentCompany());
                dto.setExpectedSalary(pref.getExpectedSalary());
            });
        });
        return dto;
    }

    // ── APPLY ─────────────────────────────────────────────────────────────────────

    /**
     * Submits a job application.
     * Steps:
     *  1. Validate jobId is present.
     *  2. Prevent duplicate applications for the same job.
     *  3. Look up the candidate's internal candidate_id via userId.
     *  4. Upload the resume PDF to Supabase 'resumes' bucket (optional but recommended).
     *  5. Save the application row with auto-filled + manually supplied fields.
     */
    @Transactional
    public JobApplicationResponse apply(UUID userId, JobApplicationRequest req, MultipartFile resumeFile) throws Exception {

        // 1. Validate required field
        if (req.getJobId() == null) {
            throw new IllegalArgumentException("jobId is required");
        }

        // 2. Look up candidate profile
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException(
                        "Candidate profile not found. Please complete your profile before applying."));

        UUID candidateId = profile.getId();

        // 3. Prevent duplicate applications
        if (jobApplicationRepository.existsByCandidateIdAndJobId(candidateId, req.getJobId())) {
            throw new IllegalStateException("You have already applied for this job.");
        }

        // 4. Upload resume (if provided) or use existing CV
        String resumeUrl = null;
        if (resumeFile != null && !resumeFile.isEmpty()) {
            // A new CV was uploaded during the application process.
            // Under the "only one CV" constraint, this new CV becomes their active profile CV!
            
            // 1. Delete existing profile resumes
            List<CandidateResume> existingResumes = resumeRepository.findByCandidateIdOrderByUploadedAtDesc(candidateId);
            for (CandidateResume oldResume : existingResumes) {
                String oldFileName = extractFileNameFromUrl(oldResume.getFileUrl(), "c_resume");
                if (oldFileName != null) {
                    try {
                        profileStorageService.deleteFile("c_resume", oldFileName);
                    } catch (Exception e) {
                        // ignore
                    }
                }
                resumeRepository.delete(oldResume);
            }
            
            // 2. Upload new CV to c_resume bucket
            String originalFilename = resumeFile.getOriginalFilename();
            String profileFileName = "cv_" + candidateId + "_" + System.currentTimeMillis() + "_" + originalFilename;
            String profileCvUrl = profileStorageService.uploadResume(resumeFile, profileFileName);
            
            // 3. Save new profile resume to DB
            CandidateResume profileResume = new CandidateResume();
            profileResume.setCandidateId(candidateId);
            profileResume.setFileName(originalFilename);
            profileResume.setFileUrl(profileCvUrl);
            profileResume.setUploadedAt(java.time.LocalDateTime.now());
            resumeRepository.save(profileResume);
            
            // 4. Upload to resumes bucket for this job application
            String appFileName = "app_" + candidateId + "_job" + req.getJobId() + "_" + System.currentTimeMillis() + "_" + originalFilename;
            resumeUrl = storageService.uploadResume(resumeFile, appFileName);
        } else {
            // Use existing profile CV if one exists (prefill/autofill flow)
            List<CandidateResume> resumes = resumeRepository.findByCandidateIdOrderByUploadedAtDesc(candidateId);
            if (!resumes.isEmpty()) {
                CandidateResume cv = resumes.get(0);
                String cvUrl = cv.getFileUrl();
                String cvFileName = cv.getFileName();
                
                // Copy/Upload the existing CV to the job applications storage bucket
                try {
                    org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                    byte[] cvBytes = restTemplate.getForObject(cvUrl, byte[].class);
                    if (cvBytes != null && cvBytes.length > 0) {
                        String appFileName = "app_" + candidateId + "_job" + req.getJobId() + "_" + System.currentTimeMillis() + "_" + cvFileName;
                        resumeUrl = storageService.uploadResume(cvBytes, appFileName);
                    }
                } catch (Exception e) {
                    // Fallback to direct URL if download/copy fails
                    resumeUrl = cvUrl;
                }
            }
        }

        // Save Candidate Preferences
        CandidatePreference pref = candidatePreferenceRepository.findById(candidateId)
                .orElse(new CandidatePreference());
        pref.setCandidateId(candidateId);
        if (req.getExpectedSalary() != null) pref.setExpectedSalary(req.getExpectedSalary());
        if (req.getYearsOfExperience() != null) pref.setYearsOfExperience(req.getYearsOfExperience());
        if (req.getCurrentRole() != null) pref.setCurrentRole(req.getCurrentRole());
        if (req.getCurrentCompany() != null) pref.setCurrentCompany(req.getCurrentCompany());
        if (req.getAvailableStartDate() != null) pref.setAvailableStartDate(req.getAvailableStartDate());
        if (req.getSource() != null) pref.setSource(req.getSource());
        candidatePreferenceRepository.save(pref);

        // 5. Build and save the application entity
        JobApplication app = new JobApplication();
        app.setCandidateId(candidateId);
        app.setJobId(req.getJobId());

        // Fetch Job to get company and job title
        JobDetails jobDetails = jobDetailsRepository.findById(req.getJobId())
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + req.getJobId()));
        
        UUID companyId = null;
        if (jobDetails.getCompanyDetails() != null) {
            companyId = jobDetails.getCompanyDetails().getCompanyid();
            app.setCompany(jobDetails.getCompanyDetails().getCompanyName());
        } else if (jobDetails.getCompany() != null && !jobDetails.getCompany().isBlank()) {
            app.setCompany(jobDetails.getCompany());
        }
        if (companyId == null) {
            throw new IllegalStateException("Job company not found. Cannot submit application without Company_Id.");
        }
        app.setJobTitle(jobDetails.getTitle());

//        app.setStatus("PENDING");
        app.setAppliedDate(LocalDate.now());

        // Auto-fill from candidates table
        app.setCandidateName(
                ((profile.getFirstName() != null ? profile.getFirstName() : "") +
                 " " + (profile.getLastName() != null ? profile.getLastName() : "")).trim());
        app.setEmail(firstNonBlank(req.getEmail(), profile.getEmail()));
        app.setPhone(firstNonBlank(req.getPhone(), profile.getPhone()));

        // Manually supplied or overridden fields
        app.setResumeUrl(resumeUrl);
        app.setCoverLetter(req.getCoverLetter());
        app.setAddress(req.getAddress());
        app.setCity(req.getCity());
        app.setLinkedinUrl(req.getLinkedinUrl());
        app.setPortfolioUrl(req.getPortfolioUrl());
        app.setGithubUrl(req.getGithubUrl());

        Long savedId = insertApplication(app, companyId);
        app.setId(savedId);
        app.setStatus("PENDING");
        return toResponse(app);
    }

    // ── READ ──────────────────────────────────────────────────────────────────────

    /**
     * Returns all applications submitted by the logged-in candidate.
     */
    public List<JobApplicationResponse> getMyApplications(UUID userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Candidate profile not found."));
        return jobApplicationRepository.findByCandidateId(profile.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single application by ID, verifying the caller owns it.
     */
    public JobApplicationResponse getApplicationById(UUID userId, Long applicationId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Candidate profile not found."));

        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        if (!app.getCandidateId().equals(profile.getId())) {
            throw new SecurityException("You do not have permission to view this application.");
        }
        return toResponse(app);
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────────

    /** Returns the first non-blank string, or null if both are blank. */
    private String firstNonBlank(String preferred, String fallback) {
        if (preferred != null && !preferred.isBlank()) return preferred.trim();
        if (fallback != null && !fallback.isBlank()) return fallback.trim();
        return null;
    }

    private Long insertApplication(JobApplication app, UUID companyId) {
        Number id = (Number) entityManager.createNativeQuery("""
                        INSERT INTO job_applications (
                            address,
                            applied_date,
                            candidate_id,
                            candidate_name,
                            city,
                            company,
                            "Company_Id",
                            cover_letter,
                            email,
                            github_url,
                            job_id,
                            job_title,
                            linkedin_url,
                            phone,
                            portfolio_url,
                            resume_url
                        )
                        VALUES (
                            :address,
                            :appliedDate,
                            :candidateId,
                            :candidateName,
                            :city,
                            :company,
                            :companyId,
                            :coverLetter,
                            :email,
                            :githubUrl,
                            :jobId,
                            :jobTitle,
                            :linkedinUrl,
                            :phone,
                            :portfolioUrl,
                            :resumeUrl
                        )
                        RETURNING id
                        """)
                .setParameter("address", app.getAddress())
                .setParameter("appliedDate", app.getAppliedDate())
                .setParameter("candidateId", app.getCandidateId())
                .setParameter("candidateName", app.getCandidateName())
                .setParameter("city", app.getCity())
                .setParameter("company", app.getCompany())
                .setParameter("companyId", companyId)
                .setParameter("coverLetter", app.getCoverLetter())
                .setParameter("email", app.getEmail())
                .setParameter("githubUrl", app.getGithubUrl())
                .setParameter("jobId", app.getJobId())
                .setParameter("jobTitle", app.getJobTitle())
                .setParameter("linkedinUrl", app.getLinkedinUrl())
                .setParameter("phone", app.getPhone())
                .setParameter("portfolioUrl", app.getPortfolioUrl())
                .setParameter("resumeUrl", app.getResumeUrl())
                .getSingleResult();
        return id.longValue();
    }

    /** Maps a JobApplication entity to a response DTO. */
    private JobApplicationResponse toResponse(JobApplication app) {
        JobApplicationResponse dto = new JobApplicationResponse();
        dto.setId(app.getId());
        dto.setCandidateId(app.getCandidateId());
        dto.setJobId(app.getJobId());
        dto.setJobTitle(app.getJobTitle());
        dto.setCompany(app.getCompany());
        dto.setCandidateName(app.getCandidateName());
        dto.setResumeUrl(app.getResumeUrl());
        dto.setStatus(app.getStatus());
        dto.setCoverLetter(app.getCoverLetter());
        dto.setEmail(app.getEmail());
        dto.setPhone(app.getPhone());
        dto.setAddress(app.getAddress());
        dto.setCity(app.getCity());
        dto.setLinkedinUrl(app.getLinkedinUrl());
        dto.setPortfolioUrl(app.getPortfolioUrl());
        dto.setAppliedDate(app.getAppliedDate());
        dto.setInterviewDate(app.getInterviewDate());
        dto.setShortlistedDate(app.getShortlistedDate());
        dto.setResult(app.getResult());
        dto.setScore(app.getScore());
        return dto;
    }

    private String extractFileNameFromUrl(String url, String encodedBucket) {
        if (url == null) return null;
        String marker = "/public/" + encodedBucket + "/";
        int idx = url.indexOf(marker);
        if (idx >= 0) {
            return url.substring(idx + marker.length());
        }
        return null;
    }
}
