package syncX.modules.score.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.cv.service.CvService;
import syncX.modules.job.entity.Job;
import syncX.modules.job.repository.JobRepository;
import syncX.modules.score.service.ScoringService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/score")
public class ScoreController {

    @Autowired
    private CvService cvService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ScoringService scoringService;


    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            @RequestParam MultipartFile file,
            @RequestParam Long jobId
    ) {

        // ===== BASIC VALIDATIONS =====

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("CV file is required");
        }

        String filename = file.getOriginalFilename();
        if (filename == null ||
                !(filename.toLowerCase().endsWith(".pdf") || filename.toLowerCase().endsWith(".docx"))) {
            return ResponseEntity.badRequest().body("Only PDF or DOCX allowed");
        }

        // FILE SIZE VALIDATION (max 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            return ResponseEntity.badRequest().body("File too large (max 2MB)");
        }

        if (jobId == null || jobId <= 0) {
            return ResponseEntity.badRequest().body("Invalid jobId");
        }

        try {

            // ===== CV PROCESSING =====
            Object parsed = cvService.processCV(file);

            if (!(parsed instanceof Map)) {
                return ResponseEntity.status(500).body("Invalid CV format returned");
            }

            Map<String, Object> cv = (Map<String, Object>) parsed;

            // ===== SAFE EXTRACTION =====

            // Skills
            List<String> cvSkills = new ArrayList<>();
            if (cv.get("skills") instanceof List<?>) {
                cvSkills = (List<String>) cv.get("skills");
            }

            // Experience
            double expYears = 0;
            if (cv.get("experienceYears") instanceof Number) {
                expYears = ((Number) cv.get("experienceYears")).doubleValue();
            }

            // Education
            String education = "";
            if (cv.get("education") != null) {
                education = cv.get("education").toString();
            }

            // ===== JOB FETCH =====
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            // ===== SCORING =====

            double skill = scoringService.skillScore(
                    cvSkills,
                    job.getRequirements()
            );

            double exp = scoringService.experienceScore(
                    expYears,
                    job.getExperienceRequired()
            );

            double edu = scoringService.educationScore(
                    education,
                    job.getEducationRequired()
            );

            double finalScore = scoringService.finalScore(skill, exp, edu);

            return ResponseEntity.ok(Map.of(
                    "score", finalScore,
                    "recommendation", finalScore >= 70 ? "Recommended" : "Not Recommended"
            ));

        } catch (RuntimeException e) {
            // known errors (like Job not found)
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            // unexpected errors
            return ResponseEntity.status(500).body("Something went wrong while analyzing CV");
        }
    }
}