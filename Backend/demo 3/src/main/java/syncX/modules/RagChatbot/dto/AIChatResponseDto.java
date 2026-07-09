package syncX.modules.RagChatbot.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AIChatResponseDto {

    private String reply;
    private int remaining;
    private int limit;

    // Null when no warning — frontend checks for presence
    private String warning;
}