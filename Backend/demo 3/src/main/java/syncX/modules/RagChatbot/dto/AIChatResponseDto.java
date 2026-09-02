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

    // NEW: current max characters allowed per message. Included on every send
    // response (not just getHistory) so the chat widget picks up a Super Admin
    // change to this setting mid-session, without needing a page refresh.
    private int maxMessageLength;
}