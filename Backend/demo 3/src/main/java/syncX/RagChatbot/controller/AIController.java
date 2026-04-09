package syncX.RagChatbot.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import syncX.RagChatbot.service.AIService;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping
public ResponseEntity<?> chat(@RequestBody Map<String, String> req) {
    try {
        String res = aiService.getAIResponse(req.get("message"));
        return ResponseEntity.ok(res);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(e.getMessage());
    }
}
}