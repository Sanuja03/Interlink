package syncX.cv.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class AiService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final String URL = "https://api.openai.com/v1/chat/completions";

    public String sendToAI(String text) {

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        // ✅ limit output tokens (cost control, no accuracy loss)
        body.put("max_tokens", 300);

        List<Map<String, String>> messages = new ArrayList<>();

        // ✅ SHORT + STRICT prompt (better + cheaper)
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
        
        CV:
        """ + text
        ));
        

        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response =
                restTemplate.postForObject(URL, request, Map.class);

        // 🔍 debug (you can remove later)
        System.out.println(response);

        // ✅ SAFE extraction (avoid crashes)
        try {
            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) response.get("choices");

            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("No AI response choices");
            }

            Map<String, Object> choice = choices.get(0);

            Map<String, Object> message =
                    (Map<String, Object>) choice.get("message");

            String content = (String) message.get("content");

            // ✅ CLEAN response (remove ```json blocks if AI adds them)
            return content
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }
}