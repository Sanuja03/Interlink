package syncX.modules.RagChatbot.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import syncX.modules.RagChatbot.dto.AIChatMessageDto;
import syncX.modules.RagChatbot.dto.AIChatRequestDto;
import syncX.modules.RagChatbot.dto.AIChatResponseDto;
import syncX.modules.RagChatbot.exception.MessageLimitException;
import syncX.modules.RagChatbot.service.AIChatMessageService;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AIChatMessageController {

    // Service to handle AI chat logic
    private final AIChatMessageService aiService;

    // Endpoint to send a message and get AI response
    @PostMapping
    public ResponseEntity<?> chat(@Valid @RequestBody AIChatRequestDto req,
                                  @AuthenticationPrincipal Jwt jwt) {
        try {
            // Extract user ID from JWT token
            UUID userId = UUID.fromString(jwt.getSubject());

            // Call service to get AI response
            AIChatResponseDto result = aiService.getAIResponse(userId, req.getMessage());

            // Return successful response
            return ResponseEntity.ok(result);

        } catch (MessageLimitException e) {
            // Handle case when user exceeds message limit
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", e.getMessage(), "limitReached", true));

        } catch (Exception e) {
            // Handle unexpected server errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Endpoint to get today's chat history
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal Jwt jwt) {
        try {
            // Extract user ID from JWT token
            UUID userId = UUID.fromString(jwt.getSubject());

            // Fetch today's chat history from service
            List<AIChatMessageDto> result = aiService.getTodayHistory(userId);

            // Return history list
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            // Handle unexpected server errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}