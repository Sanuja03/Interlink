package syncX.modules.candidateprofile.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.candidateprofile.dto.CandidateProfileDTO;
import syncX.modules.candidateprofile.entity.CandidateEducation;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.entity.CandidateResume;
import syncX.modules.candidateprofile.entity.CandidateSkill;
import syncX.modules.candidateprofile.service.CandidateProfileService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidateprofile")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateProfileController {

    @Autowired
    private CandidateProfileService service;

    // ──────────────────────────── GET FULL PROFILE ────────────────────────────

    @GetMapping("/{candidateId}")
    public ResponseEntity<?> getProfile(@PathVariable UUID candidateId) {
        try {
            CandidateProfileDTO profile = service.getFullProfile(candidateId);
            if (profile == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("getProfile called for: " + candidateId);
        }
    }

    // ──────────────────────────── UPDATE PERSONAL INFO ────────────────────────────

    @PutMapping("/{candidateId}")
    public ResponseEntity<?> updateProfile(@PathVariable UUID candidateId,
                                           @RequestBody CandidateProfile updatedData) {
        try {
            CandidateProfile updated = service.updateProfile(candidateId, updatedData);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("updateProfile called for: " + candidateId);
        }
    }

    // ──────────────────────────── SKILLS ────────────────────────────

    @PostMapping("/{candidateId}/skills")
    public ResponseEntity<?> addSkill(@PathVariable UUID candidateId,
                                      @RequestBody CandidateSkill skill) {
        try {
            CandidateSkill saved = service.addSkill(candidateId, skill);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("addSkill called for: " + candidateId);
        }
    }

    @DeleteMapping("/{candidateId}/skills/{skillId}")
    public ResponseEntity<?> deleteSkill(@PathVariable UUID candidateId,
                                         @PathVariable Long skillId) {
        try {
            service.deleteSkill(candidateId, skillId);
            return ResponseEntity.ok("Skill deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("deleteSkill called for: " + candidateId + ", skillId: " + skillId);
        }
    }

    // ──────────────────────────── EDUCATION ────────────────────────────

    @PostMapping("/{candidateId}/education")
    public ResponseEntity<?> addEducation(@PathVariable UUID candidateId,
                                          @RequestBody CandidateEducation education) {
        try {
            CandidateEducation saved = service.addEducation(candidateId, education);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("addEducation called for: " + candidateId);
        }
    }

    @DeleteMapping("/{candidateId}/education/{educationId}")
    public ResponseEntity<?> deleteEducation(@PathVariable UUID candidateId,
                                             @PathVariable Long educationId) {
        try {
            service.deleteEducation(candidateId, educationId);
            return ResponseEntity.ok("Education entry deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("deleteEducation called for: " + candidateId + ", educationId: " + educationId);
        }
    }

    // ──────────────────────────── RESUME UPLOAD ────────────────────────────

    @PostMapping("/{candidateId}/resume/upload")
    public ResponseEntity<?> uploadResume(@PathVariable UUID candidateId,
                                          @RequestParam("file") MultipartFile file) {
        try {
            CandidateResume saved = service.uploadResume(candidateId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("uploadResume called for: " + candidateId);
        }
    }

    @GetMapping("/{candidateId}/resume")
    public ResponseEntity<?> getResumes(@PathVariable UUID candidateId) {
        try {
            List<CandidateResume> resumes = service.getResumes(candidateId);
            return ResponseEntity.ok(resumes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        } finally {
            System.out.println("getResumes called for: " + candidateId);
        }
    }
}
