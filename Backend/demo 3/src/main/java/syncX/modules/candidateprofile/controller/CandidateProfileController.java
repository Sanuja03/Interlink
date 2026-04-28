package syncX.modules.candidateprofile.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.candidateprofile.dto.CandidateProfileDTO;
import syncX.modules.candidateprofile.dto.UpdateProfileRequest;
import syncX.modules.candidateprofile.entity.CandidateEducation;
import syncX.modules.candidateprofile.entity.CandidateExperience;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.entity.CandidateResume;
import syncX.modules.candidateprofile.entity.CandidateSkill;
import syncX.modules.candidateprofile.service.CandidateProfileService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for candidate profile management.
 * All endpoints extract the candidate's UUID from the Supabase JWT ('sub' claim).
 * A candidate can only access and modify their own profile.
 *
 * Base path: /api/candidate/profile  (secured to ROLE_candidate in SecurityConfig)
 */
@RestController
@RequestMapping("/api/candidate/profile")
public class CandidateProfileController {

    @Autowired
    private CandidateProfileService service;

    // ──────────────────────────── HELPER ────────────────────────────

    /**
     * Extracts the candidate's UUID from the JWT 'sub' claim.
     * Supabase sets 'sub' to the Supabase auth user ID, which we store as candidate_id.
     */
    private UUID extractCandidateId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    // ──────────────────────────── GET PROFILE ────────────────────────────

    /**
     * GET /api/candidate/profile/me
     * Returns the full profile (personal info + skills + education + resumes).
     */
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal Jwt jwt) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            CandidateProfileDTO profile = service.getFullProfile(candidateId);
            if (profile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Profile not found"));
            }
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching profile: " + e.getMessage()));
        }
    }

    // ──────────────────────────── UPDATE PERSONAL INFO ────────────────────────────

    /**
     * PUT /api/candidate/profile/me
     * Updates personal info fields (firstName, lastName, phone, bio, location).
     * Only non-null fields are applied (patch semantics).
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal Jwt jwt,
                                           @Valid @RequestBody UpdateProfileRequest req) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            CandidateProfile updated = service.updateProfile(candidateId, req);
            // Map to DTO so frontend gets consistent camelCase field names
            CandidateProfileDTO dto = new CandidateProfileDTO();
            dto.setId(updated.getId());
            dto.setFirstName(updated.getFirstName());
            dto.setLastName(updated.getLastName());
            dto.setEmail(updated.getEmail());
            dto.setPhone(updated.getPhone());
            dto.setBio(updated.getBio());
            dto.setProfilePictureUrl(updated.getProfilePictureUrl());
            dto.setLocation(updated.getLocation());
            dto.setDateOfBirth(updated.getDateOfBirth());
            dto.setHeadline(updated.getHeadline());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating profile: " + e.getMessage()));
        }
    }

    // ──────────────────────────── PROFILE PICTURE ────────────────────────────

    /**
     * POST /api/candidate/profile/me/picture  (multipart/form-data, field: "file")
     * Uploads or replaces the profile picture. Old picture is deleted from storage.
     * Allowed types: JPG, PNG, WebP. Max size: 2 MB.
     */
    @PostMapping(value = "/me/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePicture(@AuthenticationPrincipal Jwt jwt,
                                                  @RequestParam("file") MultipartFile file) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            String pictureUrl = service.uploadProfilePicture(candidateId, file);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile picture updated successfully",
                    "profilePictureUrl", pictureUrl
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading picture: " + e.getMessage()));
        }
    }

    // ──────────────────────────── RESUME / CV ────────────────────────────

    /**
     * POST /api/candidate/profile/me/resume  (multipart/form-data, field: "file")
     * Uploads a new CV. Allowed types: PDF, DOC, DOCX. Max size: 5 MB.
     */
    @PostMapping(value = "/me/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResume(@AuthenticationPrincipal Jwt jwt,
                                          @RequestParam("file") MultipartFile file) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            CandidateResume saved = service.uploadResume(candidateId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            // Validation errors from service (file type, size) should be 400
            String msg = e.getMessage() != null ? e.getMessage() : "Resume upload failed";
            boolean isValidationError = msg.contains("allowed") || msg.contains("exceed") || msg.contains("empty");
            return ResponseEntity.status(isValidationError ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", msg));
        }
    }

    /**
     * GET /api/candidate/profile/me/resumes
     * Returns all CVs uploaded by this candidate, newest first.
     */
    @GetMapping("/me/resumes")
    public ResponseEntity<?> getResumes(@AuthenticationPrincipal Jwt jwt) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            List<CandidateResume> resumes = service.getResumes(candidateId);
            return ResponseEntity.ok(resumes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching resumes: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/candidate/profile/me/resume/{resumeId}
     * Deletes a CV from the database and from Supabase storage.
     */
    @DeleteMapping("/me/resume/{resumeId}")
    public ResponseEntity<?> deleteResume(@AuthenticationPrincipal Jwt jwt,
                                          @PathVariable Long resumeId) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            service.deleteResume(candidateId, resumeId);
            return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting resume: " + e.getMessage()));
        }
    }

    // ──────────────────────────── SKILLS ────────────────────────────

    /**
     * PUT /api/candidate/profile/me/skills
     * Replaces all skills for this candidate.
     * Body: { "skills": ["Java", "React", "SQL"] }
     */
    @PutMapping("/me/skills")
    public ResponseEntity<?> replaceSkills(@AuthenticationPrincipal Jwt jwt,
                                           @RequestBody Map<String, List<String>> body) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            List<String> skills = body.get("skills");
            if (skills == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Request body must contain a 'skills' array"));
            }
            List<CandidateSkill> saved = service.replaceSkills(candidateId, skills);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating skills: " + e.getMessage()));
        }
    }

    // ──────────────────────────── EDUCATION ────────────────────────────

    /**
     * POST /api/candidate/profile/me/education
     * Adds an education entry. 'degree', 'institution', and 'startDate' are required.
     * 'endDate' is optional (null = currently studying).
     */
    @PostMapping("/me/education")
    public ResponseEntity<?> addEducation(@AuthenticationPrincipal Jwt jwt,
                                          @RequestBody CandidateEducation education) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            CandidateEducation saved = service.addEducation(candidateId, education);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error adding education: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/candidate/profile/me/education/{educationId}
     * Deletes an education entry belonging to this candidate.
     */
    @DeleteMapping("/me/education/{educationId}")
    public ResponseEntity<?> deleteEducation(@AuthenticationPrincipal Jwt jwt,
                                             @PathVariable Long educationId) {
        try {
            UUID candidateId = extractCandidateId(jwt);
            service.deleteEducation(candidateId, educationId);
            return ResponseEntity.ok(Map.of("message", "Education entry deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting education: " + e.getMessage()));
        }
    }
    // ──────────────────────────── EXPERIENCE ────────────────────────────

    /**
     * POST /api/candidate/profile/me/experience
     * Adds an experience entry. 'ccompanyName' and 'startDate' are required.
     */
    @PostMapping("/me/experience")
    public ResponseEntity<?> addExperience(@AuthenticationPrincipal Jwt jwt,
                                           @RequestBody CandidateExperience experience) {
        try {
            UUID userId = extractCandidateId(jwt);
            CandidateExperience saved = service.addExperience(userId, experience);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error adding experience: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/candidate/profile/me/experience/{experienceId}
     * Deletes an experience entry belonging to this candidate.
     */
    @DeleteMapping("/me/experience/{experienceId}")
    public ResponseEntity<?> deleteExperience(@AuthenticationPrincipal Jwt jwt,
                                              @PathVariable Long experienceId) {
        try {
            UUID userId = extractCandidateId(jwt);
            service.deleteExperience(userId, experienceId);
            return ResponseEntity.ok(Map.of("message", "Experience entry deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting experience: " + e.getMessage()));
        }
    }
}
