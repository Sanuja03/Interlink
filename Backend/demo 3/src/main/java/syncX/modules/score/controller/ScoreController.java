package syncX.modules.score.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.cv.service.AiService; // ADDED
import syncX.modules.cv.service.CvService;
import syncX.modules.job.repository.JobRepository;
import syncX.modules.score.service.ScoringService;
import syncX.modules.job.entity.Job;
import syncX.modules.job.entity.JobRequirement; // ADDED
// ── ADDED ──
import syncX.modules.subscription.service.ActiveSubscriptionService;
import java.util.UUID;
// ── END ADDED ──

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/score")
@CrossOrigin(origins = "http://localhost:5173")
public class ScoreController {

    private final CvService cvService;
    private final JobRepository jobRepository;
    private final ScoringService scoringService;
    private final AiService aiService; // ADDED
    // ── ADDED ──
    private final ActiveSubscriptionService activeSubscriptionService;
    // ── END ADDED ──

    public ScoreController(CvService cvService,
                           JobRepository jobRepository,
                           ScoringService scoringService,
                           AiService aiService, // ADDED

                           ActiveSubscriptionService activeSubscriptionService

    ) {
        this.cvService = cvService;
        this.jobRepository = jobRepository;
        this.scoringService = scoringService;
        this.aiService = aiService; // ADDED

        this.activeSubscriptionService = activeSubscriptionService;

    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            @RequestParam MultipartFile file,
            @RequestParam Long jobId,
            // companyId from frontend to enforce CV limit on backend ──
            @RequestParam(required = false) String companyId

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

        //  Backend CV limit check before any AI processing ──
        if (companyId != null && !companyId.isBlank()) {
            try {
                activeSubscriptionService.checkAndIncrementCvUsage(UUID.fromString(companyId));
            } catch (RuntimeException e) {
                // 429 Too Many Requests — limit reached
                return ResponseEntity.status(429).body(e.getMessage());
            }
        }

        // ── Processing ────────────────────────────────────────────────────────

        try {
            Object parsed = cvService.processCV(file);
            if (!(parsed instanceof Map))
                return ResponseEntity.status(500).body("Invalid CV format returned");

            @SuppressWarnings("unchecked")
            Map<String, Object> cv = (Map<String, Object>) parsed;

            // SAFE EXTRACTION (no logic change, just safer)
            List<String> cvSkills = new ArrayList<>();
            if (cv.get("skills") instanceof List<?> list) {
                for (Object s : list) {
                    if (s != null) cvSkills.add(s.toString());
                }
            }

            double expYears = 0;
            if (cv.get("experienceYears") instanceof Number num) {
                expYears = num.doubleValue();
            }

            String education = cv.get("education") != null
                    ? cv.get("education").toString()
                    : "";

            // Fetch job — includes requirements via @OneToMany
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

            // ADDED — terminal logging of raw inputs before scoring begins
            System.out.println("\n#################### CV ANALYSIS START ####################");
            System.out.println("Job: " + job.getJobTitle() + " (ID: " + jobId + ")");
            System.out.println("CV skills extracted:      " + cvSkills);
            System.out.println("CV experience (years):    " + expYears);
            System.out.println("CV education:             " + education);

            // ADDED — build required skill strings and call AI matching
            List<String> requiredSkillStrings = job.getRequirements() != null
                    ? job.getRequirements().stream().map(JobRequirement::getRequirement).toList()
                    : List.of();

            List<String> aiMatchedSkills;
            try {
                String matchJson = aiService.matchSkills(cvSkills, requiredSkillStrings);
                ObjectMapper mapper = new ObjectMapper();
                aiMatchedSkills = mapper.readValue(matchJson, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                // fail-safe: fall back to no matches rather than crashing the whole analysis
                System.out.println("[WARNING] AI skill matching failed, falling back to no matches: " + e.getMessage());
                aiMatchedSkills = List.of();
            }

            // CHANGED — skillScore now uses AI-matched skills instead of hardcoded SKILL_GROUPS only
            double skillScore = scoringService.skillScore(job.getRequirements(), aiMatchedSkills);
            double expScore   = scoringService.experienceScore(expYears, job.getExperienceRequired());
            double eduScore   = scoringService.educationScore(education, job.getEducationRequired());
            double finalScore = scoringService.finalScore(skillScore, expScore, eduScore);

            System.out.println("FINAL SCORE: " + finalScore + " / 100");
            System.out.println("#################### CV ANALYSIS END ####################\n");

            // RESPONSE (UNCHANGED)
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