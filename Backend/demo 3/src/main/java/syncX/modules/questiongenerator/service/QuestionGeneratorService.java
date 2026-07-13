package syncX.modules.questiongenerator.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import syncX.modules.questiongenerator.exception.QuestionGeneratorException;

import java.util.*;

@Service
public class QuestionGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionGeneratorService.class);

    @Value("${openai.api.key:}")
    private String apiKey;

    private final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    @Value("${rag.chat-model:gpt-4o-mini}")
    private String chatModel;

    @Value("${rag.temperature:0.7}")
    private double temperature;

    @Value("${rag.max-tokens.question:500}")
    private int maxTokensQuestion;

    @Value("${rag.max-tokens.evaluation:150}")
    private int maxTokensEvaluation;

    @Value("${rag.top-k-chunks.question:3}")
    private int topKChunksQuestion;

    @Value("${rag.top-k-chunks.evaluation:2}")
    private int topKChunksEvaluation;

    @Autowired
    private CjobpostRepository cjobpostRepository;

    @Autowired
    private QuestionGeneratorRepo questionGeneratorRepo;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private RetrievalService retrievalService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Delegate to EmbeddingService for backward compatibility.
     */
    public List<Double> getEmbedding(String text) {
        return embeddingService.getEmbedding(text);
    }

    /**
     * Delegate to RetrievalService to generate embeddings for a job post by its ID.
     */
    @Transactional
    public void generateAndStoreEmbeddingsForJob(Long jobId) {
        retrievalService.generateAndStoreEmbeddingsForJob(jobId);
    }

    /**
     * Delegate to RetrievalService for backward compatibility.
     */
    @Transactional
    public void generateAndStoreEmbeddingsForJob(Cjobpost job) {
        if (job != null) {
            retrievalService.generateAndStoreEmbeddingsForJob(job.getId());
        }
    }

    /**
     * Delegate to RetrievalService for backward compatibility.
     */
    public List<String> retrieveRelevantChunks(String searchTerms, Long jobId, int limit) {
        return retrievalService.retrieveRelevantChunks(searchTerms, jobId, limit, null);
    }

    /**
     * Overloaded delegate to RetrievalService for backward compatibility.
     */
    public List<String> retrieveRelevantChunks(String searchTerms, Long jobId, int limit, List<String> allowedChunkTypes) {
        return retrievalService.retrieveRelevantChunks(searchTerms, jobId, limit, allowedChunkTypes);
    }

    /**
     * Retrieves job requirements from the database (RAG) and calls OpenAI to generate 5 questions.
     * Candidate requests should NEVER have to generate embeddings.
     */
    @Transactional
    public List<String> generateQuestions(UUID userId, QuestionRequestDTO request) {
        if (request.getJobId() == null) {
            throw new IllegalArgumentException("Job ID must not be null");
        }

        // Check if candidate has already completed a quiz for this job
        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new QuestionGeneratorException("Candidate profile not found for user: " + userId));

        logger.info("[InterLink AI Quiz] Checking quiz attempt for candidateId: {}, jobId: {}", candidate.getId(), request.getJobId());
        boolean alreadyAttempted = questionGeneratorRepo.existsByCandidateIdAndJobId(candidate.getId(), request.getJobId());
        logger.info("[InterLink AI Quiz] alreadyAttempted result: {}", alreadyAttempted);
        if (alreadyAttempted) {
            throw new IllegalStateException("You have already attempted the AI interview for this job.");
        }

        // 1. Retrieve the Job from the DB
        Cjobpost job = cjobpostRepository.findById(request.getJobId())
                .orElseThrow(() -> new QuestionGeneratorException("Job not found with ID: " + request.getJobId()));

        // 2. Self-healing fallback: If chunks are missing, generate them on-the-fly.
        int existingChunkCount = retrievalService.countChunksForJob(job.getId());
        if (existingChunkCount == 0) {
            logger.warn("[RAG Warning] Job ID {} has no pre-computed embeddings! Generating on-the-fly as self-healing fallback.", job.getId());
            try {
                generateAndStoreEmbeddingsForJob(job.getId());
            } catch (Exception e) {
                logger.error("[RAG Exception] Failed to generate fallback embeddings on-the-fly for job ID: {}", job.getId(), e);
            }
        }

        // 3. Build rich search query representing the job post
        StringBuilder searchTermsBuilder = new StringBuilder();
        searchTermsBuilder.append(job.getTitle()).append("\n");
        if (job.getDescription() != null && !job.getDescription().isBlank()) {
            searchTermsBuilder.append(job.getDescription()).append("\n");
        }
        if (job.getRequirements() != null) {
            for (JobRequirement req : job.getRequirements()) {
                if (req.getRequirement() != null && !req.getRequirement().isBlank()) {
                    searchTermsBuilder.append(req.getRequirement()).append("\n");
                }
            }
        }
        String searchTerms = searchTermsBuilder.toString();

        // 4. Perform hybrid semantic retrieval based on the job title, description & requirements
        List<String> retrievedChunks = retrievalService.retrieveRelevantChunks(
                searchTerms, job.getId(), topKChunksQuestion, List.of("DESCRIPTION", "REQUIREMENT")
        );

        // 5. Build the Prompt
        String prompt = PromptBuilder.buildQuestionGenerationPrompt(job.getTitle(), retrievedChunks);

        // 6. Call OpenAI
        String aiResponse = callOpenAI(prompt, maxTokensQuestion);

        // 7. Parse the generated JSON response
        try {
            // Robust JSON extraction
            String cleanJson = extractJson(aiResponse, true);
            return objectMapper.readValue(cleanJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            logger.error("JSON parsing failed for AI response: {}", aiResponse, e);
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
     * Evaluates a candidate's answer using OpenAI and retrieved technical knowledge (RAG).
     */
    @Transactional
    public EvaluationResultDTO evaluateAnswer(UUID userId, AnswerSubmissionDTO submission) {
        if (submission.getJobId() == null) {
            throw new IllegalArgumentException("Job ID must not be null");
        }

        // 1. Find Candidate internal UUID from userId
        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new QuestionGeneratorException("Candidate profile not found for user: " + userId));

        // 2. Self-healing fallback: If chunks are missing during evaluation, generate them on-the-fly.
        int existingChunkCount = retrievalService.countChunksForJob(submission.getJobId());
        if (existingChunkCount == 0) {
            logger.warn("[RAG Warning] Job ID {} has no pre-computed embeddings during evaluation! Generating on-the-fly as fallback.", submission.getJobId());
            try {
                generateAndStoreEmbeddingsForJob(submission.getJobId());
            } catch (Exception e) {
                logger.error("[RAG Exception] Failed to generate fallback embeddings on-the-fly during evaluation for job ID: {}", submission.getJobId(), e);
            }
        }

        // 3. Perform semantic retrieval based on the Question and jobId (focus on context requirements and descriptions)
        List<String> retrievedChunks = retrievalService.retrieveRelevantChunks(
                submission.getQuestion(), submission.getJobId(), topKChunksEvaluation, List.of("DESCRIPTION", "REQUIREMENT")
        );

        // 3. Expected Answer Generation based on retrieved context
        String expectedAnswerPrompt = PromptBuilder.buildExpectedAnswerPrompt(submission.getQuestion(), retrievedChunks);
        String expectedAnswer = callOpenAI(expectedAnswerPrompt, 300, 0.3); // temperature 0.3 for model answer generation
        logger.info("[RAG Evaluation] Model answer formulated successfully.");

        // 4. Grounded Evaluation at 0.1 Temperature
        String prompt = PromptBuilder.buildEvaluationPromptWithContext(
                submission.getQuestion(), submission.getAnswer(), retrievedChunks, expectedAnswer
        );
        String aiResponse = callOpenAI(prompt, maxTokensEvaluation, 0.1); // temperature 0.1 for deterministic grading

        EvaluationResultDTO resultDTO = new EvaluationResultDTO();
        try {
            // Robust JSON extraction
            String cleanJson = extractJson(aiResponse, false);
            Map<String, Object> result = objectMapper.readValue(cleanJson, new TypeReference<Map<String, Object>>() {});
            
            int technicalAccuracy = getInt(result.get("technical_accuracy"));
            int coverage = getInt(result.get("coverage"));
            int practicalUnderstanding = getInt(result.get("practical_understanding"));
            int communication = getInt(result.get("communication"));
            int bestPractices = getInt(result.get("best_practices"));
            
            // Calculate final score deterministically by summing the 5 rubric scores
            int finalScore = technicalAccuracy + coverage + practicalUnderstanding + communication + bestPractices;
            
            resultDTO.setTechnicalAccuracy(technicalAccuracy);
            resultDTO.setCoverage(coverage);
            resultDTO.setPracticalUnderstanding(practicalUnderstanding);
            resultDTO.setCommunication(communication);
            resultDTO.setBestPractices(bestPractices);
            resultDTO.setFinalScore(finalScore);
            resultDTO.setScore(finalScore); // compatible field
            
            // Populate empty lists and strings for text details as requested
            resultDTO.setStrengths(Collections.emptyList());
            resultDTO.setWeaknesses(Collections.emptyList());
            resultDTO.setMissingTopics(Collections.emptyList());
            resultDTO.setRecommendations(Collections.emptyList());
            resultDTO.setFeedback("");
            
            logger.info("[RAG Evaluation] Graded answer successfully. final_score: {}", finalScore);
            
        } catch (Exception e) {
            logger.error("[RAG Evaluation Exception] Parsing failed for response: {}", aiResponse, e);
            // Basic fallback scoring
            int accuracyFallback = Math.min(40, submission.getAnswer().length() / 10);
            int finalScore = accuracyFallback + 40; // sum of fallbacks
            resultDTO.setTechnicalAccuracy(accuracyFallback);
            resultDTO.setCoverage(15);
            resultDTO.setPracticalUnderstanding(10);
            resultDTO.setCommunication(8);
            resultDTO.setBestPractices(7);
            resultDTO.setFinalScore(finalScore);
            resultDTO.setScore(finalScore);
            resultDTO.setStrengths(Collections.emptyList());
            resultDTO.setWeaknesses(Collections.emptyList());
            resultDTO.setMissingTopics(Collections.emptyList());
            resultDTO.setRecommendations(Collections.emptyList());
            resultDTO.setFeedback("Fallback scoring applied.");
        }

        return resultDTO;
    }

    private int getInt(Object obj) {
        if (obj instanceof Number) {
            return ((Number) obj).intValue();
        }
        if (obj instanceof String) {
            try {
                return Integer.parseInt((String) obj);
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
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
                .orElseThrow(() -> new QuestionGeneratorException("Candidate profile not found for user: " + userId));

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
        return callOpenAI(prompt, maxTokens, temperature);
    }

    private String callOpenAI(String prompt, int maxTokens, double temp) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new QuestionGeneratorException("OpenAI API Key is not configured.");
        }

        logger.info("[RAG OpenAI Call] Sending request to model '{}' with maxTokens: {} and temperature: {}", chatModel, maxTokens, temp);

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        body.put("model", chatModel);
        body.put("max_tokens", maxTokens);
        body.put("temperature", temp);

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
                throw new QuestionGeneratorException("Empty response from OpenAI");
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new QuestionGeneratorException("No response choices returned from OpenAI");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            logger.error("OpenAI chat request failed: {}", e.getMessage(), e);
            throw new QuestionGeneratorException("OpenAI request failed: " + e.getMessage(), e);
        }
    }

    private String extractJson(String rawResponse, boolean isArray) {
        if (rawResponse == null) return isArray ? "[]" : "{}";
        String trimmed = rawResponse.trim();
        char openChar = isArray ? '[' : '{';
        char closeChar = isArray ? ']' : '}';
        int start = trimmed.indexOf(openChar);
        int end = trimmed.lastIndexOf(closeChar);
        if (start != -1 && end != -1 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed.replaceAll("```json|```", "").trim();
    }
}
