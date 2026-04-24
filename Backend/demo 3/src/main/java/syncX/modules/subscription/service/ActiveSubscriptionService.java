package syncX.modules.subscription.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import syncX.modules.subscription.dto.ActiveSubscriptionDTO;
import syncX.modules.subscription.entity.ActiveSubscription;
import syncX.modules.subscription.entity.SubscriptionPlan;
import syncX.modules.subscription.repository.ActiveSubscriptionRepository;
import syncX.modules.subscription.repository.SubscriptionPlanRepository;
import syncX.modules.job.repository.JobRepository;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActiveSubscriptionService {

    private final ActiveSubscriptionRepository repository;
    private final SubscriptionPlanRepository planRepository;
    private final JobRepository jobRepository;

    // ─────────────────────────────────────────────
    //  GET ALL  (auto-creates Free rows for new companies)
    // ─────────────────────────────────────────────
    public List<ActiveSubscriptionDTO> getAll() {

        SubscriptionPlan freePlan = planRepository.findByName("Free")
                .orElseThrow(() -> new RuntimeException("Free plan not found"));

        List<Object[]> companies = repository.findAllCompanyNamesRaw();

        Map<UUID, String> companyNameMap = new HashMap<>();
        Map<UUID, LocalDate> companyCreatedAtMap = new HashMap<>();

        for (Object[] row : companies) {
            UUID id = UUID.fromString(row[0].toString());
            String name = row[1] != null ? row[1].toString() : "Unknown";
            companyNameMap.put(id, name);

            LocalDate createdAt = LocalDate.now();
            if (row[2] != null) {
                try {
                    if (row[2] instanceof java.sql.Timestamp) {
                        createdAt = ((java.sql.Timestamp) row[2]).toLocalDateTime().toLocalDate();
                    } else {
                        createdAt = LocalDate.parse(row[2].toString().substring(0, 10));
                    }
                } catch (Exception e) {
                    createdAt = LocalDate.now();
                }
            }
            companyCreatedAtMap.put(id, createdAt);
        }

        // Auto-create Free subscription for companies that have none
        for (UUID companyId : companyNameMap.keySet()) {
            if (repository.findByCompanyId(companyId).isEmpty()) {
                ActiveSubscription sub = new ActiveSubscription();
                sub.setCompanyId(companyId);
                sub.setPlan(freePlan);
                sub.setStartDate(companyCreatedAtMap.get(companyId));
                sub.setEndDate(null);
                sub.setStatus("Active");
                sub.setPaymentConfirmed(false);
                sub.setAiCvUsed(0);
                repository.save(sub);
            }
        }

        return repository.findAll().stream().map(sub -> {
            // Sync status to DB: mark as Expired if end date has passed and still showing Active
            if (sub.getEndDate() != null
                    && sub.getEndDate().isBefore(LocalDate.now())
                    && !"Free".equalsIgnoreCase(sub.getPlan().getName())
                    && "Active".equals(sub.getStatus())) {
                sub.setStatus("Expired");
                repository.save(sub);
            }
            return toDTO(sub, companyNameMap);
        }).toList();
    }

    // ─────────────────────────────────────────────
    //  CONFIRM PAYMENT
    //  Admin marks that payment has been received.
    //  The CRON job will handle the actual renewal on/after end date.
    //  If the company is already expired (end date passed), renew immediately.
    // ─────────────────────────────────────────────
    public ActiveSubscription confirmPayment(Long id) {
        ActiveSubscription sub = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if ("Free".equalsIgnoreCase(sub.getPlan().getName())) {
            throw new RuntimeException("Free plan does not require payment confirmation");
        }

        sub.setPaymentConfirmed(true);

        // If already expired, renew immediately from today
        if (sub.getEndDate() != null && sub.getEndDate().isBefore(LocalDate.now())) {
            renewSubscription(sub);
        }

        return repository.save(sub);
    }

    // ─────────────────────────────────────────────
    //  MANUAL EXTEND (admin triggered, e.g. for corrections)
    // ─────────────────────────────────────────────
    public ActiveSubscription extendSubscription(Long id) {
        ActiveSubscription sub = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if ("Free".equalsIgnoreCase(sub.getPlan().getName())) {
            throw new RuntimeException("Free plan cannot be renewed");
        }

        renewSubscription(sub);
        return repository.save(sub);
    }

    // ─────────────────────────────────────────────
    //  UNDO LAST RENEWAL
    // ─────────────────────────────────────────────
    public ActiveSubscription revertSubscription(Long id) {
        ActiveSubscription sub = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (sub.getStartDate() == null || sub.getEndDate() == null) {
            throw new RuntimeException("No renewal to undo");
        }

        sub.setStartDate(sub.getStartDate().minusMonths(1));
        sub.setEndDate(sub.getEndDate().minusMonths(1));
        sub.setPaymentConfirmed(false);

        return repository.save(sub);
    }

    // ─────────────────────────────────────────────
    //  CHANGE PLAN
    //  - Upgrading/changing to paid plan takes effect immediately from today (or supplied date)
    //  - Downgrading to Free: clears dates, resets usage
    // ─────────────────────────────────────────────
    public ActiveSubscription changePlan(Long id, Long newPlanId, String startDateStr) {
        ActiveSubscription sub = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        SubscriptionPlan newPlan = planRepository.findById(newPlanId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        sub.setPlan(newPlan);
        sub.setPaymentConfirmed(false);

        if ("Free".equalsIgnoreCase(newPlan.getName())) {
            sub.setStartDate(LocalDate.now());
            sub.setEndDate(null);
            sub.setAiCvUsed(0);
        } else {
            LocalDate startDate = (startDateStr != null && !startDateStr.isBlank())
                    ? LocalDate.parse(startDateStr)
                    : LocalDate.now();
            sub.setStartDate(startDate);
            sub.setEndDate(startDate.plusMonths(1));
            sub.setAiCvUsed(0);
        }

        sub.setStatus("Active");
        return repository.save(sub);
    }

    // ─────────────────────────────────────────────
    //  INCREMENT AI CV USAGE  (with limit check)
    // ─────────────────────────────────────────────
    public void incrementCvUsage(UUID companyId) {
        ActiveSubscription sub = repository.findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException("Subscription not found for company"));

        int used = sub.getAiCvUsed() == null ? 0 : sub.getAiCvUsed();
        int limit = sub.getPlan().getAiCvLimit(); // assumes SubscriptionPlan has aiCvLimit field

        if (limit > 0 && used >= limit) {
            throw new RuntimeException("AI CV generation limit reached for this plan");
        }

        sub.setAiCvUsed(used + 1);
        repository.save(sub);
    }

    // ─────────────────────────────────────────────
    //  CRON: Called by SubscriptionScheduler daily
    //  - Auto-renew subscriptions where payment is confirmed and end date is today or passed
    //  - Auto-downgrade subscriptions where end date passed and payment NOT confirmed
    // ─────────────────────────────────────────────
    public void processScheduledRenewals() {
        LocalDate today = LocalDate.now();
        List<ActiveSubscription> allSubs = repository.findAll();

        for (ActiveSubscription sub : allSubs) {
            // Skip Free plan — no automation needed
            if ("Free".equalsIgnoreCase(sub.getPlan().getName())) continue;
            if (sub.getEndDate() == null) continue;

            boolean isExpiredOrDue = !sub.getEndDate().isAfter(today); // end date <= today

            if (isExpiredOrDue) {
                if (Boolean.TRUE.equals(sub.getPaymentConfirmed())) {
                    log.info("Auto-renewing subscription id={} for company={}", sub.getId(), sub.getCompanyId());
                    renewSubscription(sub); // sets status back to Active
                    repository.save(sub);
                } else {
                    log.info("Auto-downgrading subscription id={} for company={} to Free (no payment)", sub.getId(), sub.getCompanyId());
                    sub.setStatus("Expired"); // mark expired briefly before downgrade
                    downgradeToFree(sub);     // then sets Active on Free
                    repository.save(sub);
                }
            } else if ("Expired".equals(sub.getStatus())) {
                // Re-activate if end date is in the future (e.g. after undo)
                sub.setStatus("Active");
                repository.save(sub);
            }
        }
    }

    // ─────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────

    private void renewSubscription(ActiveSubscription sub) {
        LocalDate base = (sub.getEndDate() != null && sub.getEndDate().isAfter(LocalDate.now()))
                ? sub.getEndDate()   // not yet expired: extend from end date
                : LocalDate.now();   // already expired: restart from today

        sub.setStartDate(base);
        sub.setEndDate(base.plusMonths(1));
        sub.setStatus("Active");
        sub.setPaymentConfirmed(false); // reset — needs re-confirmation for next cycle
        sub.setAiCvUsed(0);            // reset usage on each renewal
    }

    private void downgradeToFree(ActiveSubscription sub) {
        SubscriptionPlan freePlan = planRepository.findByName("Free")
                .orElseThrow(() -> new RuntimeException("Free plan not found"));
        sub.setPlan(freePlan);
        sub.setStartDate(LocalDate.now());
        sub.setEndDate(null);
        sub.setStatus("Active");
        sub.setPaymentConfirmed(false);
        sub.setAiCvUsed(0);
    }

    private ActiveSubscriptionDTO toDTO(ActiveSubscription sub, Map<UUID, String> companyNameMap) {
        ActiveSubscriptionDTO dto = new ActiveSubscriptionDTO();
        dto.setId(sub.getId());
        dto.setCompanyId(sub.getCompanyId());
        dto.setCompanyName(companyNameMap.getOrDefault(sub.getCompanyId(), "Unknown"));
        dto.setPlanName(sub.getPlan().getName());
        dto.setStartDate(sub.getStartDate());
        dto.setEndDate(sub.getEndDate());
        dto.setStatus(sub.getStatus());
        dto.setPaymentConfirmed(sub.getPaymentConfirmed() != null && sub.getPaymentConfirmed());
        dto.setAiCvUsed(sub.getAiCvUsed() != null ? sub.getAiCvUsed() : 0);
        dto.setAiCvLimit(sub.getPlan().getAiCvLimit());

        // Active job posts
        int openJobs = (sub.getCompanyId() != null)
                ? (int) jobRepository.countByCompanyIdAndStatus(sub.getCompanyId(), "Open")
                : 0;
        dto.setActiveJobsUsed(openJobs);
        dto.setActiveJobsLimit(sub.getPlan().getActiveJobs() != null ? sub.getPlan().getActiveJobs() : 0);

        // Interviewers — uses native query in repository, no separate entity needed
        int interviewerCount = (sub.getCompanyId() != null)
                ? (int) repository.countInterviewersByCompanyId(sub.getCompanyId())
                : 0;
        dto.setInterviewersUsed(interviewerCount);
        dto.setInterviewersLimit(sub.getPlan().getInterviewers() != null ? sub.getPlan().getInterviewers() : 0);

        return dto;
    }
}