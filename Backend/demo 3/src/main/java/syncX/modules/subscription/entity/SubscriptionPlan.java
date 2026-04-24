package syncX.modules.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "ai_cv_limit")
    private Integer aiCvLimit = 0; // 0 = unlimited (for Free)

    @Column(name = "active_jobs")
    private Integer activeJobs;

    private double price;
    private Integer interviewers;
    private Integer aiQuestionLimit;
    private Boolean isUnlimited;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}