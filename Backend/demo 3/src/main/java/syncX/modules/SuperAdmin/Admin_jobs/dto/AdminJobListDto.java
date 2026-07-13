package syncX.modules.SuperAdmin.Admin_jobs.dto;

public record AdminJobListDto(
        Long id,
        String title,
        String location,
        String employmentType,
        String category,
        String status,
        String companyName
) {}