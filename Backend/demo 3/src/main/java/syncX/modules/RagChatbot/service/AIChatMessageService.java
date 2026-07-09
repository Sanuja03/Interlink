package syncX.modules.RagChatbot.service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import lombok.RequiredArgsConstructor;
import syncX.modules.RagChatbot.dto.AIChatHistoryWrapperDto;
import syncX.modules.RagChatbot.dto.AIChatMessageDto;
import syncX.modules.RagChatbot.dto.AIChatResponseDto;
import syncX.modules.RagChatbot.entity.AIChatMessage;
import syncX.modules.RagChatbot.entity.AIChatSession;
import syncX.modules.RagChatbot.exception.MessageLimitException;
import syncX.modules.RagChatbot.repository.AIChatMessageRepository;
import syncX.modules.RagChatbot.repository.AIChatSessionRepository;

@Service
@RequiredArgsConstructor
public class AIChatMessageService {

    private static final Logger logger = LoggerFactory.getLogger(AIChatMessageService.class);

    // Daily message cap per user — AI replies do not count toward this
    private static final int DAILY_LIMIT = 15;

    // Warn the user when they hit this threshold
    private static final int WARNING_THRESHOLD = 13;

    private final AIChatSessionRepository chatSessionRepository;
    private final AIChatMessageRepository chatMessageRepository;
    private WebClient webClient;

    @Value("${openai.api.key}")
    public void initWebClient(String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Process a user message within their daily session.
     * Enforces the daily message limit, builds conversation history,
     * calls OpenAI.
     *
     * @param userId    UUID of the authenticated user
     * @param userInput The message text from the user
     * @return Map containing the AI reply, remaining message count, and any warning
     */
    public AIChatResponseDto getAIResponse(UUID userId, String userInput) {
        // Get or create today's session for this user
        AIChatSession session = chatSessionRepository
                .findByUserIdAndSessionDate(userId, LocalDate.now())
                .orElseGet(() -> chatSessionRepository.save(
                        AIChatSession.builder().userId(userId).build()
                ));

        // Reject if daily limit is reached
        if (session.getMessageCount() >= DAILY_LIMIT) {
            throw new MessageLimitException("Daily message limit reached. Please try again tomorrow.");
        }

        // Build the system prompt — strictly to Interlink and recruitment topics
        String context = loadInterlinkData();
        String systemPrompt = """
                You are an AI assistant embedded in Interlink, a recruitment management platform.
                You ONLY answer questions related to:
                - Interlink platform features, data, and usage
                - Recruitment, hiring, job postings, candidates, and interviews
                - HR workflows and processes

                If a question falls outside these topics, politely decline and remind the user
                that you are scoped to Interlink and recruitment-related queries only.

                Rules:
                - Answer in clear, professional language
                - Do not return raw JSON
                - Be concise and accurate

                INTERLINK KNOWLEDGE BASE:
                %s
                """.formatted(context);

        // Load full conversation history for this session
        List<AIChatMessage> history = chatMessageRepository
                .findBySessionOrderByCreatedAtAsc(session);

        // Assemble the messages array: system prompt + history + new user message
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        for (AIChatMessage msg : history) {
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }
        messages.add(Map.of("role", "user", "content", userInput));

        // Persist user message and increment the daily count before calling OpenAI
        chatMessageRepository.save(AIChatMessage.builder()
                .session(session)
                .role("user")
                .content(userInput)
                .build());

        session.setMessageCount(session.getMessageCount() + 1);
        chatSessionRepository.save(session);

        // Call OpenAI
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4.1-mini",
                "messages", messages
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            String aiText = extractChatText(response);

            // Persist the AI reply — does not count toward the user's limit
            chatMessageRepository.save(AIChatMessage.builder()
                    .session(session)
                    .role("assistant")
                    .content(aiText)
                    .build());

            int remaining = DAILY_LIMIT - session.getMessageCount();

            // Build response including limit data for the frontend
            return AIChatResponseDto.builder()
                    .reply(aiText)
                    .remaining(remaining)
                    .limit(DAILY_LIMIT)
                    .warning(session.getMessageCount() >= WARNING_THRESHOLD
                            ? "You have " + remaining + " messages remaining today."
                            : null)
                    .build();


        } catch (WebClientResponseException e) {
            logger.error("OpenAI API error: {}", e.getResponseBodyAsString());
            throw new RuntimeException("OpenAI error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            logger.error("Unexpected error during AI request", e);
            throw new RuntimeException("Server error: " + e.getMessage());
        }
    }

    /**
     * Returns the message history AND the current daily limits
     * for the user's current day session.
     */
    public AIChatHistoryWrapperDto getTodayHistory(UUID userId) {
        // 1. Check for an existing session today
        Optional<AIChatSession> sessionOpt = chatSessionRepository
                .findByUserIdAndSessionDate(userId, LocalDate.now());

        // 2. Calculate the current message count and remaining limit
        int currentCount = sessionOpt.map(AIChatSession::getMessageCount).orElse(0);
        int remaining = DAILY_LIMIT - currentCount;

        // 3. Fetch the chat history (empty list if no session exists yet)
        List<AIChatMessageDto> history = sessionOpt
                .map(session -> chatMessageRepository
                        .findBySessionOrderByCreatedAtAsc(session)
                        .stream()
                        .map(m -> AIChatMessageDto.builder()
                                .role(m.getRole())
                                .content(m.getContent())
                                .time(m.getCreatedAt().toString())
                                .build())
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());

        // 4. Return the combined data
        return AIChatHistoryWrapperDto.builder()
                .history(history)
                .remaining(remaining)
                .limit(DAILY_LIMIT)
                .build();
    }

     // Extracts the reply text from an OpenAI chat/completions response.

    private String extractChatText(Map<String, Object> response) {
        try {
            List<?> choices = (List<?>) response.get("choices");
            if (choices == null || choices.isEmpty()) return "No response received.";
            Map<?, ?> message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            logger.error("Failed to parse OpenAI response", e);
            return "Error parsing AI response.";
        }
    }

    private String loadInterlinkData() {
        try {
            return new String(Files.readAllBytes(
                    Paths.get("src/main/resources/interlink.json")));
        } catch (Exception e) {
            logger.error("Error loading Interlink data", e);
            return "{}";
        }
    }
}