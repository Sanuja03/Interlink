package syncX.modules.score.controller;

import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping("/api/score")
@CrossOrigin("*")
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
            @RequestParam Long jobId   // ✅ KEEP Long (matches DB)
    ) {

        // ✅ VALIDATIONS (UNCHANGED)
        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().body("CV file is required");

        String filename = file.getOriginalFilename();
        if (filename == null ||
                !(filename.toLowerCase().endsWith(".pdf") || filename.toLowerCase().endsWith(".docx")))
            return ResponseEntity.badRequest().body("Only PDF or DOCX allowed");

        if (file.getSize() > 2 * 1024 * 1024)
            return ResponseEntity.badRequest().body("File too large (max 2MB)");

        if (jobId == null || jobId <= 0)
            return ResponseEntity.badRequest().body("Invalid jobId");

        try {
            // ✅ PROCESS CV
            Object parsed = cvService.processCV(file);
            if (!(parsed instanceof Map))
                return ResponseEntity.status(500).body("Invalid CV format returned");

            @SuppressWarnings("unchecked")
            Map<String, Object> cv = (Map<String, Object>) parsed;

            // ✅ SAFE EXTRACTION (no logic change, just safer)
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

            // ✅ FETCH JOB (FIXED TYPE MATCH)
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

            // ✅ SCORING (UNCHANGED LOGIC)
            double skillScore = scoringService.skillScore(cvSkills, job.getRequirements());
            double expScore   = scoringService.experienceScore(expYears, job.getExperienceRequired());
            double eduScore   = scoringService.educationScore(education, job.getEducationRequired());
            double finalScore = scoringService.finalScore(skillScore, expScore, eduScore);

            // ✅ RESPONSE (UNCHANGED)
            return ResponseEntity.ok(Map.of(
                    "score", finalScore,
                    "skillScore", Math.round(skillScore * 100),
                    "expScore", Math.round(expScore * 100),
                    "eduScore", Math.round(eduScore * 100),
                    "recommendation", finalScore >= 70 ? "Recommended" : "Not Recommended"
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong: " + e.getMessage());
        }
    }
}