package syncX.modules.subscription.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import syncX.modules.subscription.dto.ActiveSubscriptionDTO;
import syncX.modules.subscription.entity.ActiveSubscription;
import syncX.modules.subscription.service.ActiveSubscriptionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/active-subscriptions")
@RequiredArgsConstructor
@CrossOrigin
public class ActiveSubscriptionController {

    private final ActiveSubscriptionService service;

    @GetMapping
    public List<ActiveSubscriptionDTO> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}/extend")
    public ActiveSubscription extend(@PathVariable Long id) {
        return service.extendSubscription(id);
    }

    @PutMapping("/{id}/revert")
    public ActiveSubscription revert(@PathVariable Long id) {
        return service.revertSubscription(id);
    }

    // ✅ UPDATED
    @PutMapping("/{id}/change-plan/{planId}")
    public ActiveSubscription changePlan(
            @PathVariable Long id,
            @PathVariable Long planId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String startDate = body != null ? body.get("startDate") : null;
        return service.changePlan(id, planId, startDate);
    }
}