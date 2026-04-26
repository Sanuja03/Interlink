package syncX.modules.score.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.cv.service.CvService;
import syncX.modules.job.repository.JobRepository;
import syncX.modules.score.service.ScoringService;
import syncX.modules.job.entity.Job;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST controller for CV scoring against a job posting.
 *
 * Security notes:
 * - CORS restricted to frontend origin only (was @CrossOrigin("*"))
 * - Constructor injection used instead of @Autowired field injection
 * - File validated for type and size before processing
 */
@RestController
@RequestMapping("/api/score")
@CrossOrigin(origins = "http://localhost:5173")
public class ScoreController {

    private final CvService      cvService;
    private final JobRepository  jobRepository;
    private final ScoringService scoringService;

    /**
     * Constructor injection — makes dependencies explicit and testable.
     * Replaced @Autowired field injection which hides dependencies.
     */
    public ScoreController(CvService cvService,
                           JobRepository jobRepository,
                           ScoringService scoringService) {
        this.cvService      = cvService;
        this.jobRepository  = jobRepository;
        this.scoringService = scoringService;
    }

    /**
     * Analyzes a CV file against a job's requirements and returns scores.
     *
     * Validates:
     * - File presence and non-empty
     * - File extension (PDF or DOCX only)
     * - File size (max 2 MB)
     * - jobId is a positive value
     *
     * @param file  the uploaded CV file
     * @param jobId the ID of the job to score against
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            @RequestParam MultipartFile file,
            @RequestParam Long jobId
    ) {
        // ── Input validation ──────────────────────────────────────────────────

        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().body("CV file is required");

        String filename = file.getOriginalFilename();
        if (filename == null ||
                !(filename.toLowerCase().endsWith(".pdf") ||
                        filename.toLowerCase().endsWith(".docx")))
            return ResponseEntity.badRequest().body("Only PDF or DOCX files are allowed");

        if (file.getSize() > 2 * 1024 * 1024)
            return ResponseEntity.badRequest().body("File too large (max 2 MB)");

        if (jobId == null || jobId <= 0)
            return ResponseEntity.badRequest().body("Invalid jobId");

        // ── Processing ────────────────────────────────────────────────────────

        try {
            Object parsed = cvService.processCV(file);
            if (!(parsed instanceof Map))
                return ResponseEntity.status(500).body("Invalid CV format returned");

            @SuppressWarnings("unchecked")
            Map<String, Object> cv = (Map<String, Object>) parsed;

            List<String> cvSkills = new ArrayList<>();
            if (cv.get("skills") instanceof List<?>)
                cvSkills = (List<String>) cv.get("skills");

            double expYears = 0;
            if (cv.get("experienceYears") instanceof Number)
                expYears = ((Number) cv.get("experienceYears")).doubleValue();

            String education = cv.get("education") != null
                    ? cv.get("education").toString()
                    : "";

            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

            double skillScore = scoringService.skillScore(cvSkills, job.getRequirements());
            double expScore   = scoringService.experienceScore(expYears, job.getExperienceRequired());
            double eduScore   = scoringService.educationScore(education, job.getEducationRequired());
            double finalScore = scoringService.finalScore(skillScore, expScore, eduScore);

            return ResponseEntity.ok(Map.of(
                    "score",          finalScore,
                    "skillScore",     Math.round(skillScore * 100),
                    "expScore",       Math.round(expScore   * 100),
                    "eduScore",       Math.round(eduScore   * 100),
                    "recommendation", finalScore >= 70 ? "Recommended" : "Not Recommended"
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }
}