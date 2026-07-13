package syncX.modules.cv.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

/**
 * Service for calling the OpenAI Chat Completions API.
 *
 * Design notes:
 * - RestTemplate is injected as a shared Spring bean instead of being
 *   created per-request (new RestTemplate() per call is wasteful and
 *   prevents connection pooling).
 *
 *
 *   @Bean
 *   public RestTemplate restTemplate() { return new RestTemplate(); }
 */
@Service
public class AiService {

    @Value("${openai.api.key:}")
    private String apiKey;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate;

    /**
     * Constructor injection of the shared RestTemplate bean.
     */
    @Autowired
    public AiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Sends CV text to OpenAI and returns a JSON string with extracted fields:
     * name, skills, experienceYears, education.
     *
     * @param text  cleaned CV text content
     * @return      raw JSON string from the AI
     * @throws RuntimeException if the API key is missing or the response cannot be parsed
     */
    public String sendToAI(String text) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("AI feature is disabled (missing API key)");
        }

        //request body to send to api
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");
        body.put("max_tokens", 300); // For Cost control — sufficient for structured JSON output

        //conversation sent to ai
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of(
                "role", "user",
                "content", """
        Return ONLY valid JSON:
        
        {
          "name": "",
          "skills": [],
          "experienceYears": number,
          "education": ""
        }
        
        Rules:
        - Skills MUST be individual keywords (e.g., "Java", "Python", "Communication")
        - Do NOT return sentences
        - Split combined skills into separate items
        - Keep skills short and standardized
        - Infer related skills based on context (e.g., "Spring Boot" implies "Java", backend development)
        - Include both explicit and implicit skills
        - Normalize similar technologies into common terms where appropriate
        
        CV:
        """ + text   //cv text attached
        ));
        body.put("messages", messages);

        //http request sent to the api
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(OPENAI_URL, request, Map.class);

        return extractContent(response);
    }

    /**
     * Sends job description text to OpenAI and returns extracted requirements as JSON:
     * skills, experienceRequired, educationRequired.
     *
     * @param text  job description text
     * @return      raw JSON string from the AI
     */
    public String extractJobData(String text) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("AI feature is disabled (missing API key)");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");
        body.put("max_tokens", 200);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of(
                "role", "user",
                "content", """
Return ONLY valid JSON:

{
  "skills": [],
  "experienceRequired": number,
  "educationRequired": ""
}

Rules:
- Extract ONLY skills explicitly mentioned in the text
- Do NOT infer or add extra skills
- Do NOT assume related technologies (e.g., React does not imply HTML/CSS)
- Skills must be exact keywords from the text
- Skills must be single keywords (React, Java, Communication)
- Remove adjectives like "good", "strong"
- Do NOT duplicate similar skills
- Normalize skills to base form (e.g., "React", "Java")
- Extract years of experience as a number
- Keep education simple (Degree, Diploma, Masters)

Text:
""" + text
        ));
        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(OPENAI_URL, request, Map.class);

        return extractContent(response);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Extracts the text content from an OpenAI chat completion response.
     * Also strips markdown code fences (```json ... ```) that the model sometimes adds.
     *
     * @param response  the raw Map returned by RestTemplate
     * @return          clean JSON string
     */
    @SuppressWarnings("unchecked")

    //convert raw ai response to clear json string
    private String extractContent(Map<String, Object> response) {
        try {
            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) response.get("choices");

            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("No choices in AI response");
            }

            Map<String, Object> message =
                    (Map<String, Object>) choices.get(0).get("message");

            String content = (String) message.get("content");

            // Strip markdown code fences the model occasionally wraps responses in
            return content
                    .replace("```json", "")         //removes markdown formatting
                    .replace("```", "")
                    .trim();

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }
}