package syncX.modules.SuperAdmin.Admin_jobs.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminJobDetailsDto(
        Long id,
        String title,
        String location,
        String employmentType,
        String category,
        String status,
        OffsetDateTime createdAt,
        UUID companyId,
        String companyName,
        long totalApplications
) {}