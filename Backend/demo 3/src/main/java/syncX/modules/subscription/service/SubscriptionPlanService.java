package syncX.modules.subscription.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import syncX.modules.subscription.dto.SubscriptionPlanDTO;
import syncX.modules.subscription.entity.SubscriptionPlan;
import syncX.modules.subscription.repository.SubscriptionPlanRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository repository;

    public List<SubscriptionPlan> getAllPlans() {
        return repository.findAll();
    }

    public SubscriptionPlan updatePlan(String name, SubscriptionPlanDTO dto) {
        validatePlan(dto);

        SubscriptionPlan plan = repository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setPrice(dto.getPrice());
        plan.setActiveJobs(dto.getActiveJobs());
        plan.setInterviewers(dto.getInterviewers());

        if (Boolean.TRUE.equals(dto.getIsUnlimited())) {
            plan.setAiCvLimit(null);
            plan.setAiQuestionLimit(null);
        } else {
            plan.setAiCvLimit(dto.getAiCvLimit());
            plan.setAiQuestionLimit(dto.getAiQuestionLimit());
        }

        plan.setIsUnlimited(dto.getIsUnlimited());
        plan.setUpdatedAt(LocalDateTime.now());

        return repository.save(plan);
    }

    private void validatePlan(SubscriptionPlanDTO dto) {
        if (dto.getPrice() < 0) throw new IllegalArgumentException("Price cannot be negative");
        if (dto.getActiveJobs() != null && dto.getActiveJobs() < 0) throw new IllegalArgumentException("Active jobs cannot be negative");
        if (dto.getInterviewers() != null && dto.getInterviewers() < 0) throw new IllegalArgumentException("Interviewers cannot be negative");
        if (dto.getAiCvLimit() != null && dto.getAiCvLimit() < 0) throw new IllegalArgumentException("AI CV limit cannot be negative");
        if (dto.getAiQuestionLimit() != null && dto.getAiQuestionLimit() < 0) throw new IllegalArgumentException("AI Question limit cannot be negative");
    }
}