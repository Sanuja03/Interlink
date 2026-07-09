package syncX.modules.subscription.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import syncX.modules.subscription.dto.SubscriptionPlanDTO;
import syncX.modules.subscription.entity.SubscriptionPlan;
import syncX.modules.subscription.service.SubscriptionPlanService;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin
public class SubscriptionPlanController {

    private final SubscriptionPlanService service;

    @GetMapping
    public List<SubscriptionPlan> getAllPlans() {
        return service.getAllPlans();
    }

    @PutMapping("/{name}")
    public SubscriptionPlan updatePlan(
            @PathVariable String name,
            @RequestBody SubscriptionPlanDTO dto
    ) {
        return service.updatePlan(name, dto);
    }
}
