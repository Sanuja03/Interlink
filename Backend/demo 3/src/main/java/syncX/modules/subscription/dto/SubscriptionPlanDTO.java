package syncX.modules.subscription.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SubscriptionPlanDTO {

    @NotBlank
    private String name;

    @PositiveOrZero
    private double price;

    private Integer activeJobs;
    private String applications;
    private Integer interviewers;
    private Integer aiCvLimit;
    private Integer aiQuestionLimit;
    private Boolean isUnlimited;
}