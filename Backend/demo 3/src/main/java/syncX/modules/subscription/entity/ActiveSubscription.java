package syncX.modules.subscription.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "active_subscriptions")
@Data
public class ActiveSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id")
    private UUID companyId;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private SubscriptionPlan plan;

    @Column(name = "ai_cv_used")
    private Integer aiCvUsed = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private String status;

    /**
     * Set to true by admin when payment is received.
     * The scheduler will auto-renew on end date if this is true.
     * Resets to false after each renewal cycle.
     */
    @Column(name = "payment_confirmed")
    private Boolean paymentConfirmed = false;
}