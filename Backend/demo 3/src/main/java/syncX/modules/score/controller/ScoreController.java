package syncX.modules.score.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import syncX.modules.cv.service.CvService;
import syncX.modules.job.entity.Job;
import syncX.modules.job.repository.JobRepository;
import syncX.modules.score.service.ScoringService;

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

    private ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            @RequestParam MultipartFile file,
            @RequestParam Long jobId
    ) {
        try {

            Object parsed = cvService.processCV(file);

            Map<String, Object> cv = (Map<String, Object>) parsed;

            Job job = jobRepository.findById(jobId).orElseThrow();

            double skill = scoringService.skillScore(
                    (List<String>) cv.get("skills"),
                    job.getRequirements()
            );

            double exp = scoringService.experienceScore(
                    ((Number) cv.get("experienceYears")).doubleValue(),
                    job.getExperienceRequired()
            );

            double edu = scoringService.educationScore(
                    (String) cv.get("education"),
                    job.getEducationRequired()
            );

            double finalScore = scoringService.finalScore(skill, exp, edu);

            return ResponseEntity.ok(Map.of(
                    "score", finalScore,
                    "recommendation", finalScore >= 70 ? "Recommended" : "Not Recommended"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}