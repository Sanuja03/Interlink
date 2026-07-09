package syncX.modules.SuperAdmin.Admin_users.dto;

public record AdminInterviewerAvailabilityDayDto(
        String dayName,       // e.g. "Monday"
        Boolean isAvailable   // true = available (green), false = unavailable (red), null = not set (grey)
) {}