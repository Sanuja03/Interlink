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
}