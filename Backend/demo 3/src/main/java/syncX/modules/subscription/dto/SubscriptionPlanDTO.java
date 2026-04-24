package syncX.modules.subscription.dto;

import lombok.Data;

@Data
public class SubscriptionPlanDTO {
    private String name;
    private double price;
    private Integer activeJobs;
    private Integer interviewers;
    private Integer aiCvLimit;
    private Integer aiQuestionLimit;
    private Boolean isUnlimited;
}