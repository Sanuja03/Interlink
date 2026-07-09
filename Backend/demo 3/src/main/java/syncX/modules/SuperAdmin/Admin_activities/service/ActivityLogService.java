package syncX.modules.SuperAdmin.Admin_activities.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import lombok.RequiredArgsConstructor;
import syncX.modules.SuperAdmin.Admin_activities.dto.ActivityLogDto;
import syncX.modules.SuperAdmin.Admin_activities.dto.CreateActivityLogDto;
import syncX.modules.SuperAdmin.Admin_activities.entity.ActivityLog;
import syncX.modules.SuperAdmin.Admin_activities.repository.ActivityLogRepository;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository repository;

    //  INTERNAL LOG METHOD (used by system)
    public void log(
            UUID userId,
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

    //  GET LOGS (DTO)
    public Page<ActivityLogDto> getLogs(
            String userRole,
            String search,
            String fromDate,
            String toDate,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        userRole = (userRole == null) ? "" : userRole;
        search = (search == null) ? "" : search;
        fromDate = (fromDate == null) ? "" : fromDate;
        toDate = (toDate == null) ? "" : toDate;

        LocalDateTime from = null;
        LocalDateTime to = null;

        try {
            if (!fromDate.isEmpty()) {
                from = LocalDateTime.parse(fromDate + "T00:00:00");
            }

            if (!toDate.isEmpty()) {
                to = LocalDateTime.parse(toDate + "T23:59:59");
            }
        } catch (Exception e) {
            System.out.println("Date parse error: " + e.getMessage());
        }

        return repository
                .searchLogs(userRole, search, from, to, pageable)
                .map(this::mapToDto); // use dto
    }

    //  CREATE LOG (DTO)
    public ActivityLogDto createLog(CreateActivityLogDto dto) {

        ActivityLog log = ActivityLog.builder()
                .userId(dto.userId())
                .userRole(dto.userRole())
                .action(dto.action())
                .entityType(dto.entityType())
                .entityId(dto.entityId())
                .description(dto.description())
                .createdAt(LocalDateTime.now())
                .build();

        return mapToDto(repository.save(log));
    }

    // MAPPER
    private ActivityLogDto mapToDto(ActivityLog log) {
        return new ActivityLogDto(
                log.getId(),
                log.getUserId(),
                log.getUserRole(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription(),
                log.getCreatedAt()
        );
    }
}