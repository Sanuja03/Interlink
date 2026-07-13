package syncX.modules.RagChatbot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "chat_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AIChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK to users table — stored as UUID
    @Column(nullable = false)
    private UUID userId;

    // One session per user per day — enforced at service level
    @Column(nullable = false)
    private LocalDate sessionDate;

    // Total messages sent by the user today (AI replies do not count toward limit)
    @Column(nullable = false)
    private int messageCount;

    @PrePersist
    public void prePersist() {
        this.sessionDate = LocalDate.now();
        this.messageCount = 0;
    }
}