package syncX.modules.RagChatbot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.RagChatbot.entity.AIChatMessage;
import syncX.modules.RagChatbot.entity.AIChatSession;

import java.util.List;

public interface AIChatMessageRepository extends JpaRepository<AIChatMessage, Long> {

    // Load full conversation history for a session, oldest first
    List<AIChatMessage> findBySessionOrderByCreatedAtAsc(AIChatSession session);
}