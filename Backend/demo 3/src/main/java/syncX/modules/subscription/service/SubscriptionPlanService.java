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
        SubscriptionPlan plan = repository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setPrice(dto.getPrice());
        plan.setActiveJobs(dto.getActiveJobs());
        plan.setApplications(dto.getApplications());
        plan.setInterviewers(dto.getInterviewers());
        plan.setAiCvLimit(dto.getAiCvLimit());
        plan.setAiQuestionLimit(dto.getAiQuestionLimit());
        plan.setIsUnlimited(dto.getIsUnlimited());
        plan.setUpdatedAt(LocalDateTime.now());

        return repository.save(plan);
    }
}