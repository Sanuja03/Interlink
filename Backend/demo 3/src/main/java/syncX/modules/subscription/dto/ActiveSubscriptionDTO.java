package syncX.modules.subscription.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ActiveSubscriptionDTO {
    private Long id;
    private UUID companyId;
    private String companyName;
    private String planName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Boolean paymentConfirmed;

    // AI CV usage
    private Integer aiCvUsed;
    private Integer aiCvLimit;

    // Active job posts usage
    private Integer activeJobsUsed;
    private Integer activeJobsLimit;

    // Interviewer usage
    private Integer interviewersUsed;
    private Integer interviewersLimit;
}