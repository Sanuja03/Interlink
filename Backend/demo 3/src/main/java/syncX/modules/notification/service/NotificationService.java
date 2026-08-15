package syncX.modules.notification.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.notification.dto.NotificationDTO;
import syncX.modules.notification.entity.Notification;
import syncX.modules.notification.repository.NotificationRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repository;

    public List<NotificationDTO> getForUser(UUID userId) {
        return repository.findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public long getUnreadCount(UUID userId) {
        return repository.countByRecipientUserIdAndReadFalse(userId);
    }

    public void markAsRead(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    public void markAllAsRead(UUID userId) {
        List<Notification> all = repository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
        all.forEach(n -> n.setRead(true));
        repository.saveAll(all);
    }

    private NotificationDTO toDto(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setReferenceId(n.getReferenceId());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}