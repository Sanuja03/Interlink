package syncX.Admin_activities.service;



import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import syncX.Admin_activities.entity.ActivityLog;
import syncX.Admin_activities.repository.ActivityLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository repository;

    public void log(
            Long userId,
            String userRole,
            String action,
            String entityType,
            Long entityId,
            String description
    ) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .userRole(userRole)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(log);
    }

    public Page<ActivityLog> getLogs(
            String userRole,
            int page,
            int size
    ) {
        return repository.findByUserRoleContainingIgnoreCase(
                userRole,
                PageRequest.of(page, size,
                        Sort.by("createdAt").descending())
        );
    }
}

