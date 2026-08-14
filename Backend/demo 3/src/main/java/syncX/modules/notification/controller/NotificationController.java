package syncX.modules.notification.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import syncX.modules.auth.service.AuthContextService;
import syncX.modules.notification.dto.NotificationDTO;
import syncX.modules.notification.service.NotificationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @Autowired
    private AuthContextService authContextService;

    @GetMapping
    public List<NotificationDTO> getMyNotifications(@AuthenticationPrincipal Jwt jwt) {
        return service.getForUser(authContextService.getUserId(jwt));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("count", service.getUnreadCount(authContextService.getUserId(jwt)));
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        service.markAllAsRead(authContextService.getUserId(jwt));
    }
}