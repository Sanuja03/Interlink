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
        long totalApplications,
        long underReview,   // applications with status PENDING
        long interviews,    // finalized interview_requests for this job
        long engagements    // accepted applications as engagement proxy
) {}