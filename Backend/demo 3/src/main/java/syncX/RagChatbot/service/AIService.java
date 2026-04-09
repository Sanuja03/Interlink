package syncX.RagChatbot.service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class AIService {

    private final WebClient webClient;

    public AIService(@Value("${OPENAI_API_KEY}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String getAIResponse(String userInput) {
        System.out.println("🔥 CALLING OPENAI /responses API");

        String context = loadInterlinkData();

        // Debug JSON
        System.out.println("📦 JSON LOADED:\n" + context);

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

        System.out.println("🧠 PROMPT LENGTH: " + prompt.length());

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

            // 🔥 PRINT FULL RESPONSE
            System.out.println("📥 FULL RESPONSE:\n" + response);

            // 🔥 TOKEN USAGE
            Map<String, Object> usage = (Map<String, Object>) response.get("usage");
            if (usage != null) {
                System.out.println("🧠 TOKENS USED:");
                System.out.println("Input: " + usage.get("input_tokens"));
                System.out.println("Output: " + usage.get("output_tokens"));
                System.out.println("Total: " + usage.get("total_tokens"));
            }

            String finalOutput = extractText(response);
            System.out.println("✅ FINAL OUTPUT:\n" + finalOutput);

            return finalOutput;

        } catch (WebClientResponseException e) {
            System.out.println("🔴 OpenAI API ERROR:");
            System.out.println(e.getResponseBodyAsString());
            return "OpenAI Error: " + e.getResponseBodyAsString();

        } catch (Exception e) {
            e.printStackTrace();
            return "Server Error: " + e.getMessage();
        }
    }

    // 🔥 BETTER extractor (handles real OpenAI structure)
    private String extractText(Map<String, Object> response) {
        try {
            List<Map<String, Object>> output =
                    (List<Map<String, Object>>) response.get("output");

            for (Map<String, Object> item : output) {
                if ("message".equals(item.get("type"))) {

                    List<Map<String, Object>> content =
                            (List<Map<String, Object>>) item.get("content");

                    for (Map<String, Object> c : content) {
                        if ("output_text".equals(c.get("type"))) {
                            return (String) c.get("text");
                        }
                    }
                }
            }

            return "No AI response found.";

        } catch (Exception e) {
            e.printStackTrace();
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
            return "Error loading Interlink data";
        }
    }
}