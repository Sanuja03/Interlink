package syncX.modules.subscription.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.subscription.dto.ActiveSubscriptionDTO;
import syncX.modules.subscription.entity.ActiveSubscription;
import syncX.modules.subscription.service.ActiveSubscriptionService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    // ── ADDED: company admin fetches their own active subscription ──
    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getMySubscription(@PathVariable UUID companyId) {
        try {
            return ResponseEntity.ok(service.getByCompanyId(companyId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // ── END ADDED ──

    /**
     * Admin marks that payment has been received.
     * If already expired, renews immediately.
     * Otherwise, the CRON will renew on/after end date.
     */
    @PutMapping("/{id}/confirm-payment")
    public ActiveSubscription confirmPayment(@PathVariable Long id) {
        return service.confirmPayment(id);
    }

    /**
     * Manual extend (admin override / correction tool).
     */
    @PutMapping("/{id}/extend")
    public ActiveSubscription extend(@PathVariable Long id) {
        return service.extendSubscription(id);
    }

    /**
     * Undo last renewal (shift dates back by 1 month).
     */
    @PutMapping("/{id}/revert")
    public ActiveSubscription revert(@PathVariable Long id) {
        return service.revertSubscription(id);
    }

    /**
     * Change company's plan. For paid plans, takes effect immediately from today (or provided startDate).
     */
    @PutMapping("/{id}/change-plan/{planId}")
    public ActiveSubscription changePlan(
            @PathVariable Long id,
            @PathVariable Long planId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String startDate = body != null ? body.get("startDate") : null;
        return service.changePlan(id, planId, startDate);
    }

    /**
     * Increment AI CV usage for a company. Returns 429 if limit reached.
     */
    @PutMapping("/increment-cv-usage/{companyId}")
    public ResponseEntity<?> incrementCvUsage(@PathVariable UUID companyId) {
        try {
            service.incrementCvUsage(companyId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("limit reached")) {
                return ResponseEntity.status(429).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}