package syncX.modules.questiongenerator.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.repository.CandidateProfileRepository;
import syncX.modules.cjobpost.entity.Cjobpost;
import syncX.modules.cjobpost.entity.JobRequirement;
import syncX.modules.cjobpost.repository.CjobpostRepository;
import syncX.modules.questiongenerator.dto.AnswerSubmissionDTO;
import syncX.modules.questiongenerator.dto.EvaluationResultDTO;
import syncX.modules.questiongenerator.dto.QuestionRequestDTO;
import syncX.modules.questiongenerator.entity.QuestionGeneratorEntity;
import syncX.modules.questiongenerator.repository.QuestionGeneratorRepo;
import syncX.modules.questiongenerator.util.PromptBuilder;

import java.util.*;

@Service
public class QuestionGeneratorService {

    @Value("${openai.api.key:}")
    private String apiKey;

    private final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    @Autowired
    private CjobpostRepository cjobpostRepository;

    @Autowired
    private QuestionGeneratorRepo questionGeneratorRepo;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Retrieves job requirements from the database (RAG) and calls OpenAI to generate 5 questions.
     */
    @Transactional(readOnly = true)
    public List<String> generateQuestions(UUID userId, QuestionRequestDTO request) {
        if (request.getJobId() == null) {
            throw new IllegalArgumentException("Job ID must not be null");
        }

        // Check if candidate has already completed a quiz for this job
        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found for user: " + userId));

        System.out.println("[InterLink AI Quiz] Checking quiz attempt for candidateId: " + candidate.getId() + ", jobId: " + request.getJobId());
        boolean alreadyAttempted = questionGeneratorRepo.existsByCandidateIdAndJobId(candidate.getId(), request.getJobId());
        System.out.println("[InterLink AI Quiz] alreadyAttempted result: " + alreadyAttempted);
        if (alreadyAttempted) {
            throw new IllegalStateException("You have already attempted the AI interview for this job.");
        }

        // 1. Retrieve the Job from the DB (RAG)
        Cjobpost job = cjobpostRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + request.getJobId()));

        // Extract job requirements list
        List<String> requirementsList = new ArrayList<>();
        if (job.getRequirements() != null) {
            for (JobRequirement req : job.getRequirements()) {
                requirementsList.add(req.getRequirement());
            }
        }
        // 2. Build the Prompt
        String prompt = PromptBuilder.buildQuestionGenerationPrompt(job.getTitle(), job.getDescription(), requirementsList);

        // 3. Call OpenAI
        String aiResponse = callOpenAI(prompt, 500);

        // 4. Parse the generated JSON response
        try {
            // Remove markdown code blocks if OpenAI wrapped the response in ```json ... ```
            String cleanJson = aiResponse.replaceAll("```json|```", "").trim();
            return objectMapper.readValue(cleanJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            System.err.println("JSON parsing failed for AI response: " + aiResponse);
            e.printStackTrace();
            return Arrays.asList(
                    "Can you explain your experience working on similar requirements?",
                    "What challenges did you face with the technologies specified in the job post?",
                    "Describe a project where you solved a difficult technical problem.",
                    "How do you ensure code quality and performance in your work?",
                    "Why are you interested in this role and company?"
            );
        }
    }

    /**
     * Evaluates a candidate's answer using OpenAI.
     */
    @Transactional(readOnly = true)
    public EvaluationResultDTO evaluateAnswer(UUID userId, AnswerSubmissionDTO submission) {
        if (submission.getJobId() == null) {
            throw new IllegalArgumentException("Job ID must not be null");
        }

        // 1. Find Candidate internal UUID from userId
        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found for user: " + userId));

        // 2. Build Prompt & Call OpenAI
        String prompt = PromptBuilder.buildEvaluationPrompt(submission.getQuestion(), submission.getAnswer());
        String aiResponse = callOpenAI(prompt, 150);

        int score = 0;
        try {
            String cleanJson = aiResponse.replaceAll("```json|```", "").trim();
            Map<String, Object> result = objectMapper.readValue(cleanJson, new TypeReference<Map<String, Object>>() {});
            Object scoreObj = result.get("score");
            if (scoreObj instanceof Number) {
                score = ((Number) scoreObj).intValue();
            }
        } catch (Exception e) {
            // Basic fallback scoring logic if OpenAI parsing fails
            score = Math.min(100, Math.max(50, submission.getAnswer().length() / 5));
        }

        EvaluationResultDTO resultDTO = new EvaluationResultDTO();
        resultDTO.setScore(score);
        return resultDTO;
    }

    /**
     * Persists the combined overall score and summary of questions and answers to the database as a single record.
     */
    @Transactional
    public void saveOverallScore(UUID userId, Long jobId, List<String> questions, List<String> answers, int overallScore) {
        if (jobId == null) {
            throw new IllegalArgumentException("Job ID must not be null");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found for user: " + userId));

        // Join questions and answers with a visual delimiter
        String joinedQuestions = String.join("\n\n", questions);
        String joinedAnswers = String.join("\n\n", answers);

        QuestionGeneratorEntity scoreEntity = new QuestionGeneratorEntity();
        scoreEntity.setCandidateId(candidate.getId());
        scoreEntity.setJobId(jobId);
        scoreEntity.setQuestion(joinedQuestions);
        scoreEntity.setAnswer(joinedAnswers);
        scoreEntity.setScore(overallScore);

        questionGeneratorRepo.save(scoreEntity);
    }

    private String callOpenAI(String prompt, int maxTokens) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("OpenAI API Key is not configured.");
        }

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");
        body.put("max_tokens", maxTokens);
        body.put("temperature", 0.7);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of(
                "role", "user",
                "content", prompt
        ));
        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(OPENAI_URL, request, Map.class);
            if (response == null || !response.containsKey("choices")) {
                throw new RuntimeException("Empty response from OpenAI");
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("No response choices returned from OpenAI");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            throw new RuntimeException("OpenAI request failed: " + e.getMessage(), e);
        }
    }
}
