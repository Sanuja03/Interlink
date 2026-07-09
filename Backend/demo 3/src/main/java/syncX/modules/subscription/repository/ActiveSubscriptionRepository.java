package syncX.modules.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.subscription.entity.ActiveSubscription;

public interface ActiveSubscriptionRepository
        extends JpaRepository<ActiveSubscription, Long> {
}