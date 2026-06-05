package syncX.modules.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

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

    private double price;
    private Integer activeJobs;
    private String applications;
    private Integer interviewers;
    private Integer aiCvLimit;
    private Integer aiQuestionLimit;
    private Boolean isUnlimited;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}