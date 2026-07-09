package syncX.modules.RagChatbot.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AIChatMessageDto {

    private String role;
    private String content;
    private String time;
}