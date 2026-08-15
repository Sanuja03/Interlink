package syncX.modules.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.notification.entity.Notification;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(UUID recipientUserId);
    long countByRecipientUserIdAndReadFalse(UUID recipientUserId);
}