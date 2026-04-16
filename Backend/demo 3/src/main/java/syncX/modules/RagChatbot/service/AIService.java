package syncX.modules.RagChatbot.service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    private final WebClient webClient;

    public AIService(@Value("${OPENAI_API_KEY}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String getAIResponse(String userInput) {
        logger.info(" CALLING OPENAI /responses API");

        String context = loadInterlinkData();
        logger.debug(" JSON LOADED:\n{}", context);

        String prompt = """
        You are an AI assistant for a system called Interlink.

        Your task:
        - Read the JSON data
        - Understand it
        - Answer the question in natural language

        STRICT RULES:
        - DO NOT return JSON
        - DO NOT copy the data directly
        - ALWAYS summarize or explain in sentences
        - Keep answers clear and user-friendly

        JSON DATA:
        %s

        USER QUESTION:
        %s
        """.formatted(context, userInput);

        logger.info(" PROMPT LENGTH: {}", prompt.length());

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4.1-mini",
                "input", prompt
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/responses")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            logger.debug(" FULL RESPONSE: {}", response);

            //  SAFE CAST for usage
            Object usageObj = response.get("usage");
            if (usageObj instanceof Map<?, ?> usageMap) {
                logger.info(" TOKENS USED:");
                logger.info("Input: {}", usageMap.get("input_tokens"));
                logger.info("Output: {}", usageMap.get("output_tokens"));
                logger.info("Total: {}", usageMap.get("total_tokens"));
            }

            String finalOutput = extractText(response);
            logger.info(" FINAL OUTPUT: {}", finalOutput);

            return finalOutput;

        } catch (WebClientResponseException e) {
            logger.error(" OpenAI API ERROR: {}", e.getResponseBodyAsString());
            return "OpenAI Error: " + e.getResponseBodyAsString();

        } catch (Exception e) {
            logger.error(" Server Error", e);
            return "Server Error: " + e.getMessage();
        }
    }

    //  SAFE extractor (no unchecked cast warnings)
    private String extractText(Map<String, Object> response) {
        try {
            Object outputObj = response.get("output");

            if (!(outputObj instanceof List<?> rawOutputList)) {
                return "No AI response found.";
            }

            for (Object itemObj : rawOutputList) {
                if (itemObj instanceof Map<?, ?> item) {

                    if ("message".equals(item.get("type"))) {

                        Object contentObj = item.get("content");

                        if (contentObj instanceof List<?> rawContentList) {

                            for (Object contentItemObj : rawContentList) {
                                if (contentItemObj instanceof Map<?, ?> contentItem) {

                                    if ("output_text".equals(contentItem.get("type"))) {
                                        Object text = contentItem.get("text");

                                        if (text instanceof String) {
                                            return (String) text;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return "No AI response found.";

        } catch (Exception e) {
            logger.error(" Error parsing AI response", e);
            return "Error parsing AI response.";
        }
    }

    private String loadInterlinkData() {
        try {
            return new String(
                    Files.readAllBytes(
                            Paths.get("src/main/resources/interlink.json")
                    )
            );
        } catch (Exception e) {
            logger.error(" Error loading Interlink data", e);
            return "Error loading Interlink data";
        }
    }
}