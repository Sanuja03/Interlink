package syncX.modules.subscription.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ActiveSubscriptionDTO {

    private Long id;

    private UUID companyId;

    private String planName;

    private LocalDate startDate;
    private LocalDate endDate;

    private String status;
}