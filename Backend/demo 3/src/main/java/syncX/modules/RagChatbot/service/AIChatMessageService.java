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
import syncX.modules.RagChatbot.exception.InvalidInputException;
import syncX.modules.RagChatbot.exception.MessageLimitException;
import syncX.modules.RagChatbot.repository.AIChatMessageRepository;
import syncX.modules.RagChatbot.repository.AIChatSessionRepository;
import syncX.modules.SuperAdmin.Admin_settings.repository.SASettingsRepository;

@Service
@RequiredArgsConstructor
public class AIChatMessageService {

    private static final Logger logger = LoggerFactory.getLogger(AIChatMessageService.class);

    private final SASettingsRepository settingsRepository;

    private int getDailyLimit() {
        return getChatbotSetting("dailyLimit", 15);
    }

    private int getWarningThreshold(int dailyLimit) {
        // Read from DB, fall back to 85% of daily limit if not configured
        return getChatbotSetting("warningThreshold", (int) Math.floor(dailyLimit * 0.85));
    }

    // NEW: max characters allowed per user message. DB-configurable via CHATBOT
    // settings (key: "maxMessageLength"), defaults to 1000 if not configured.
    private int getMaxMessageLength() {
        return getChatbotSetting("maxMessageLength", 1000);
    }

    // Reusable helper to avoid repeating the same DB lookup logic
    private int getChatbotSetting(String keyName, int fallback) {
        return settingsRepository.findByCategory("CHATBOT")
                .stream()
                .filter(s -> keyName.equals(s.getKeyName()))
                .findFirst()
                .map(s -> {
                    try { return Integer.parseInt(s.getValue()); }
                    catch (Exception e) { return fallback; }
                })
                .orElse(fallback);
    }

    // Max conversation turns passed to OpenAI — prevents token bloat on long sessions
    private static final int MAX_HISTORY_MESSAGES = 10;

    private final AIChatSessionRepository chatSessionRepository;
    private final AIChatMessageRepository chatMessageRepository;
    private WebClient webClient;

    // Cached knowledge base — loaded once from disk, reused for every request
    private String cachedInterlinkData = null;

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
     * Validates the message (non-blank, within max length), enforces the daily
     * message limit, builds conversation history, selects relevant knowledge base
     * sections, and calls OpenAI.
     *
     * @param userId    UUID of the authenticated user
     * @param userInput The message text from the user
     * @return DTO containing the AI reply, remaining message count, and any warning
     */
    public AIChatResponseDto getAIResponse(UUID userId, String userInput) {

        int dailyLimit       = getDailyLimit();
        int warningThreshold = getWarningThreshold(dailyLimit);
        int maxMessageLength = getMaxMessageLength();

        // --- NEW: input validation (blank + max length) ---
        // Runs before we touch the session/DB/OpenAI, so invalid input never
        // consumes a daily message slot or reaches the model.
        String trimmedInput = userInput == null ? "" : userInput.trim();

        if (trimmedInput.isEmpty()) {
            throw new InvalidInputException(
                    "Message cannot be empty.",
                    InvalidInputException.Reason.BLANK,
                    maxMessageLength
            );
        }

        if (trimmedInput.length() > maxMessageLength) {
            throw new InvalidInputException(
                    "Message exceeds the maximum length of " + maxMessageLength + " characters.",
                    InvalidInputException.Reason.TOO_LONG,
                    maxMessageLength
            );
        }

        userInput = trimmedInput;
        // --- end validation ---

        // Get or create today's session for this user
        AIChatSession session = chatSessionRepository
                .findByUserIdAndSessionDate(userId, LocalDate.now())
                .orElseGet(() -> chatSessionRepository.save(
                        AIChatSession.builder().userId(userId).build()
                ));

        // Reject if daily limit is reached
        if (session.getMessageCount() >= dailyLimit) {
            throw new MessageLimitException("Daily message limit reached. Please try again tomorrow.");
        }

        // Select only relevant sections of the knowledge base for this query
        String context = selectRelevantContext(userInput, loadInterlinkData());

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
                - Keep responses reasonably brief; do not pad answers unnecessarily

                INTERLINK KNOWLEDGE BASE:
                %s
                """.formatted(context);

        // Load full conversation history for this session
        List<AIChatMessage> allHistory = chatMessageRepository
                .findBySessionOrderByCreatedAtAsc(session);

        // Limit history to last N messages to prevent token bloat on long conversations
        List<AIChatMessage> history = allHistory.size() > MAX_HISTORY_MESSAGES
                ? allHistory.subList(allHistory.size() - MAX_HISTORY_MESSAGES, allHistory.size())
                : allHistory;

        // Assemble messages: system prompt + trimmed history + new user message
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        for (AIChatMessage msg : history) {
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }
        messages.add(Map.of("role", "user", "content", userInput));

        // Persist user message and increment daily count before calling OpenAI
        chatMessageRepository.save(AIChatMessage.builder()
                .session(session)
                .role("user")
                .content(userInput)
                .build());

        session.setMessageCount(session.getMessageCount() + 1);
        chatSessionRepository.save(session);

        // NEW: cap the AI's own reply length so it can't run past what the UI
        // reasonably displays, and — more importantly — fixes a pre-existing bug
        // where no max_tokens was set at all, causing OpenAI to apply its own
        // default and cut long answers off mid-sentence.
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4.1-mini",
                "messages", messages,
                "max_tokens", 600
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            String aiText = extractChatText(response);

            // Persist AI reply — does not count toward the user's daily limit
            chatMessageRepository.save(AIChatMessage.builder()
                    .session(session)
                    .role("assistant")
                    .content(aiText)
                    .build());

            int remaining = dailyLimit - session.getMessageCount();

            return AIChatResponseDto.builder()
                    .reply(aiText)
                    .remaining(remaining)
                    .limit(dailyLimit)
                    .warning(session.getMessageCount() >= warningThreshold
                            ? "You have " + remaining + " messages remaining today."
                            : null)
                    .maxMessageLength(maxMessageLength)
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
     * Returns the message history and current daily/character limits for the
     * user's session.
     */
    public AIChatHistoryWrapperDto getTodayHistory(UUID userId) {
        int dailyLimit = getDailyLimit();
        int maxMessageLength = getMaxMessageLength();
        Optional<AIChatSession> sessionOpt = chatSessionRepository
                .findByUserIdAndSessionDate(userId, LocalDate.now());

        int currentCount = sessionOpt.map(AIChatSession::getMessageCount).orElse(0);
        int remaining = dailyLimit - currentCount;

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

        return AIChatHistoryWrapperDto.builder()
                .history(history)
                .remaining(remaining)
                .limit(dailyLimit)
                .maxMessageLength(maxMessageLength)
                .build();
    }

    /**
     * Selects only the relevant sections of the knowledge base based on keywords
     * in the user's message. Always includes name and description for grounding.
     * Falls back to the full context if no keyword match is found.
     * This reduces token usage without requiring a vector database.
     *
     * Updated for the new interlink.json structure: company-related queries now
     * also pull in "core_features" (where company_management/company_registration
     * workflows live), and notification/support/dashboard queries have their own
     * keyword group instead of always falling back to the full KB.
     */
    private String selectRelevantContext(String userInput, String fullContext) {
        try {
            String input = userInput.toLowerCase();
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                    new com.fasterxml.jackson.databind.ObjectMapper();
            Map<?, ?> data = mapper.readValue(fullContext, Map.class);

            // Keyword patterns mapped to relevant JSON section keys
            Map<String, List<String>> keywordSections = Map.ofEntries(
                    Map.entry("subscription|plan|tier|limit|pricing|upgrade",
                            List.of("subscription_tiers", "platform_rules", "core_features")),
                    Map.entry("job|post|vacancy|create job|edit job|employment",
                            List.of("core_features", "how_to_use")),
                    Map.entry("candidate|apply|application|cv|screening|rank",
                            List.of("core_features", "how_to_use", "user_roles")),
                    Map.entry("interview|schedule|feedback|score|availability",
                            List.of("core_features", "how_to_use")),
                    Map.entry("company|register|approval|suspend|flag",
                            List.of("core_features", "user_roles", "platform_rules", "how_to_use")),
                    Map.entry("admin|super admin|settings|activity|log|dashboard",
                            List.of("user_roles", "platform_rules", "core_features")),
                    Map.entry("interviewer|panel|round",
                            List.of("user_roles", "how_to_use", "core_features")),
                    Map.entry("notification|support|ticket|help",
                            List.of("core_features", "how_to_use"))
            );

            Set<String> matchedKeys = new LinkedHashSet<>();
            for (Map.Entry<String, List<String>> entry : keywordSections.entrySet()) {
                String[] keywords = entry.getKey().split("\\|");
                for (String keyword : keywords) {
                    if (input.contains(keyword)) {
                        matchedKeys.addAll(entry.getValue());
                        break;
                    }
                }
            }

            // Always include top-level identity fields for grounding
            Map<String, Object> selected = new LinkedHashMap<>();
            selected.put("name", data.get("name"));
            selected.put("description", data.get("description"));

            if (matchedKeys.isEmpty()) {
                // No keyword match — send full context as fallback
                return fullContext;
            }

            for (String key : matchedKeys) {
                if (data.containsKey(key)) {
                    selected.put(key, data.get(key));
                }
            }

            return mapper.writeValueAsString(selected);

        } catch (Exception e) {
            logger.warn("Context selection failed, falling back to full context", e);
            return fullContext;
        }
    }

    /**
     * Extracts the reply text from an OpenAI chat/completions response.
     * NEW: also checks finish_reason so a mid-sentence cutoff (finish_reason
     * == "length") gets logged instead of silently shipping a truncated reply.
     */
    private String extractChatText(Map<String, Object> response) {
        try {
            List<?> choices = (List<?>) response.get("choices");
            if (choices == null || choices.isEmpty()) return "No response received.";

            Map<?, ?> choice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) choice.get("message");
            String content = (String) message.get("content");

            Object finishReason = choice.get("finish_reason");
            if ("length".equals(finishReason)) {
                logger.warn("OpenAI response was truncated by max_tokens (finish_reason=length). "
                        + "Consider raising max_tokens or shortening the system prompt/context.");
            }

            return content;
        } catch (Exception e) {
            logger.error("Failed to parse OpenAI response", e);
            return "Error parsing AI response.";
        }
    }

    /**
     * Loads the Interlink knowledge base from disk on first call,
     * then serves from memory cache on all subsequent calls.
     */
    private String loadInterlinkData() {
        if (cachedInterlinkData != null) return cachedInterlinkData;
        try {
            cachedInterlinkData = new String(Files.readAllBytes(
                    Paths.get("src/main/resources/interlink.json")));
            return cachedInterlinkData;
        } catch (Exception e) {
            logger.error("Error loading Interlink data", e);
            return "{}";
        }
    }
}