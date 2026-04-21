package syncX.modules.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.subscription.entity.SubscriptionPlan;

import java.util.Optional;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findByName(String name);
}
