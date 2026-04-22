package syncX.modules.subscription.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import syncX.modules.subscription.dto.ActiveSubscriptionDTO;
import syncX.modules.subscription.entity.ActiveSubscription;
import syncX.modules.subscription.entity.SubscriptionPlan;
import syncX.modules.subscription.repository.ActiveSubscriptionRepository;
import syncX.modules.subscription.repository.SubscriptionPlanRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActiveSubscriptionService {

    private final ActiveSubscriptionRepository repository;
    private final SubscriptionPlanRepository planRepository;

    public List<ActiveSubscriptionDTO> getAll() {
        return repository.findAll().stream().map(sub -> {

            ActiveSubscriptionDTO dto = new ActiveSubscriptionDTO();

            dto.setId(sub.getId());
            dto.setCompanyId(sub.getCompanyId());
            dto.setPlanName(sub.getPlan().getName());
            dto.setStartDate(sub.getStartDate());
            dto.setEndDate(sub.getEndDate());
            dto.setStatus(sub.getStatus());

            return dto;

        }).toList();
    }

    public ActiveSubscription extendSubscription(Long id) {

        ActiveSubscription sub = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if ("Free".equalsIgnoreCase(sub.getPlan().getName())) {
            throw new RuntimeException("Free plan cannot be renewed");
        }

        LocalDate today = LocalDate.now();

        sub.setStartDate(today);
        sub.setEndDate(today.plusMonths(1));
        sub.setStatus("Active");

        return repository.save(sub);
    }

    public ActiveSubscription revertSubscription(Long id) {

        ActiveSubscription sub = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        sub.setStartDate(sub.getStartDate().minusMonths(1));
        sub.setEndDate(sub.getEndDate().minusMonths(1));

        return repository.save(sub);
    }

    // ✅ UPDATED
    public ActiveSubscription changePlan(Long id, Long newPlanId, String startDateStr) {

        ActiveSubscription sub = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        SubscriptionPlan newPlan = planRepository.findById(newPlanId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        sub.setPlan(newPlan);

        if ("Free".equalsIgnoreCase(newPlan.getName())) {
            sub.setStartDate(null);
            sub.setEndDate(null);
        } else {
            LocalDate startDate;

            if (startDateStr != null && !startDateStr.isEmpty()) {
                startDate = LocalDate.parse(startDateStr);
            } else {
                startDate = LocalDate.now();
            }

            sub.setStartDate(startDate);
            sub.setEndDate(startDate.plusMonths(1));
        }

        sub.setStatus("Active");

        return repository.save(sub);
    }
}