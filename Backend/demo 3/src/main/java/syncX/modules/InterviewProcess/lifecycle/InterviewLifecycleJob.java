package syncX.modules.InterviewProcess.lifecycle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import syncX.modules.InterviewProcess.lifecycle.service.InterviewLifecycleService;

/**
 * Timer-driven cleanup of stale interview state. Nothing calls this — Spring's
 * scheduler runs it automatically, so the DB stays the single source of truth
 * even when no one is using the app.
 *
 * Scope is deliberately limited to interview REQUESTS that lapsed before a panel
 * was confirmed. Interviews that were successfully scheduled are never touched by
 * a timer, whatever their date: only the company admin ends one, by cancelling it.
 *
 * Requires @EnableScheduling on the main @SpringBootApplication class.
 */
@Component
public class InterviewLifecycleJob {

    @Autowired
    private InterviewLifecycleService lifecycleService;

    // Runs 15 min after the previous run finishes. Override with
    // interview.lifecycle.interval-ms in application.properties if needed.
    @Scheduled(fixedDelayString = "${interview.lifecycle.interval-ms:900000}")
    public void run() {
        try {
            int cancelled = lifecycleService.cancelPendingPastDate();
            if (cancelled > 0) {
                System.out.println("[InterviewLifecycleJob] pending→cancelled: " + cancelled);
            }
        } catch (Exception e) {
            // Print the stack trace too — a bare getMessage() on a Hibernate
            // ConstraintViolationException hides which column actually failed.
            System.err.println("[InterviewLifecycleJob] run failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}