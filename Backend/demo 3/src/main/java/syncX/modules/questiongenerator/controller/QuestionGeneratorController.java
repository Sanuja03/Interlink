package syncX.modules.questiongenerator.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import syncX.modules.questiongenerator.dto.AnswerSubmissionDTO;
import syncX.modules.questiongenerator.dto.EvaluationResultDTO;
import syncX.modules.questiongenerator.dto.QuestionRequestDTO;
import syncX.modules.questiongenerator.dto.SaveScoreDTO;
import syncX.modules.questiongenerator.service.QuestionGeneratorService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/question-generator")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionGeneratorController {

    @Autowired
    private QuestionGeneratorService service;

    private UUID extractUserId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuestions(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody QuestionRequestDTO request
    ) {
        try {
            UUID userId = extractUserId(jwt);
            List<String> questions = service.generateQuestions(userId, request);
            return ResponseEntity.ok(questions);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating questions: " + e.getMessage()));
        }
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAnswer(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody AnswerSubmissionDTO submission
    ) {
        try {
            UUID userId = extractUserId(jwt);
            EvaluationResultDTO result = service.evaluateAnswer(userId, submission);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error evaluating answer: " + e.getMessage()));
        }
    }

    @PostMapping("/save-score")
    public ResponseEntity<?> saveScore(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody SaveScoreDTO saveRequest
    ) {
        try {
            UUID userId = extractUserId(jwt);
            service.saveOverallScore(
                    userId,
                    saveRequest.getJobId(),
                    saveRequest.getQuestions(),
                    saveRequest.getAnswers(),
                    saveRequest.getScore()
            );
            return ResponseEntity.ok(Map.of("message", "Score saved successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error saving score: " + e.getMessage()));
        }
    }
}
