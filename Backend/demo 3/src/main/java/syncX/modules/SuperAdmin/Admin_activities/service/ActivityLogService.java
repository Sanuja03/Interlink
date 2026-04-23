package syncX.modules.SuperAdmin.Admin_activities.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import lombok.RequiredArgsConstructor;
import syncX.modules.SuperAdmin.Admin_activities.entity.ActivityLog;
import syncX.modules.SuperAdmin.Admin_activities.repository.ActivityLogRepository;

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
        toDate =  (toDate == null) ? "" : toDate ;

        LocalDateTime from = null;
        LocalDateTime to = null;

        try{
        if (!fromDate.isEmpty()) {
            from = LocalDateTime.parse(fromDate + "T00:00:00");
        }

        if (!toDate.isEmpty()) {
            to = LocalDateTime.parse(toDate + "T23:59:59");}
        }catch (Exception e) {
            System.out.println("Date parse error: " + e.getMessage());
        }

        return repository.searchLogs(userRole, search, from, to, pageable);
    }
    public ActivityLog createLog(ActivityLog log) {
        log.setCreatedAt(LocalDateTime.now());
        return repository.save(log);
    }
}

