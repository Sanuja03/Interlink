package syncX.modules.RagChatbot.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class AIChatHistoryWrapperDto {
    private List<AIChatMessageDto> history;
    private int remaining;
    private int limit;
    // NEW: current max characters allowed per message, driven by the
    // "maxMessageLength" CHATBOT setting. Lets the frontend widget reflect
    // Super Admin changes without hardcoding the limit client-side.
    private int maxMessageLength;
}