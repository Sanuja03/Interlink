package syncX.modules.RagChatbot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.RagChatbot.entity.AIChatSession;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface AIChatSessionRepository extends JpaRepository<AIChatSession, Long> {

    // Retrieve today's session for a given user, if one exists
    Optional<AIChatSession> findByUserIdAndSessionDate(UUID userId, LocalDate date);
}