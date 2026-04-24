package syncX.modules.subscription.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import syncX.modules.subscription.service.ActiveSubscriptionService;

/**
 * Daily CRON scheduler for subscription lifecycle management.
 *
 * Rules:
 *  - FREE plans: no action ever taken (no end dates, no renewals).
 *  - PAID plans (Growth, Enterprise, etc.):
 *      • If end date reached AND payment_confirmed = true  → auto-renew for 1 more month, reset payment_confirmed to false, reset ai_cv_used to 0.
 *      • If end date reached AND payment_confirmed = false → auto-downgrade to Free plan.
 *
 * Runs every day at midnight (00:00).
 * You can adjust the cron expression for your timezone using zone = "Asia/Colombo" etc.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionScheduler {

    private final ActiveSubscriptionService subscriptionService;

    /**
     * Runs every day at 00:00 server time.
     * Change zone to match your server/business timezone.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Colombo")
    public void processSubscriptions() {
        log.info("=== [SubscriptionScheduler] Running daily subscription check ===");
        try {
            subscriptionService.processScheduledRenewals();
            log.info("=== [SubscriptionScheduler] Completed ===");
        } catch (Exception e) {
            log.error("=== [SubscriptionScheduler] Error during processing: {}", e.getMessage(), e);
        }
    }
}