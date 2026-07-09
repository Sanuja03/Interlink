package syncX.modules.questiongenerator.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import syncX.modules.questiongenerator.exception.QuestionGeneratorException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(EmbeddingService.class);

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${rag.embedding-model:text-embedding-3-small}")
    private String embeddingModel;

    private final String EMBEDDING_URL = "https://api.openai.com/v1/embeddings";

    // In-memory cache for generated embeddings
    private final Map<String, List<Double>> embeddingCache = new ConcurrentHashMap<>();

    /**
     * Helper to get vector embedding from OpenAI for a text chunk.
     */
    public List<Double> getEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        // Check cache first
        if (embeddingCache.containsKey(text)) {
            logger.info("[RAG Caching] Returning cached embedding for text: '{}'", text.substring(0, Math.min(25, text.length())) + "...");
            return embeddingCache.get(text);
        }

        if (apiKey == null || apiKey.isEmpty()) {
            throw new QuestionGeneratorException("OpenAI API Key is not configured.");
        }

        logger.info("[RAG Embedding] Generating embedding using model '{}' for text: '{}'", embeddingModel, text.substring(0, Math.min(25, text.length())) + "...");

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("input", text);
        body.put("model", embeddingModel);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(EMBEDDING_URL, request, Map.class);
            if (response == null || !response.containsKey("data")) {
                throw new QuestionGeneratorException("Empty response from OpenAI embeddings API");
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.get("data");
            if (dataList == null || dataList.isEmpty()) {
                throw new QuestionGeneratorException("No embedding data returned from OpenAI");
            }

            @SuppressWarnings("unchecked")
            List<Double> embedding = (List<Double>) dataList.get(0).get("embedding");
            
            // Cache the result
            embeddingCache.put(text, embedding);
            return embedding;
        } catch (Exception e) {
            logger.error("OpenAI Embedding generation failed for text chunk: {}", text, e);
            throw new QuestionGeneratorException("OpenAI Embedding generation failed: " + e.getMessage(), e);
        }
    }
}
