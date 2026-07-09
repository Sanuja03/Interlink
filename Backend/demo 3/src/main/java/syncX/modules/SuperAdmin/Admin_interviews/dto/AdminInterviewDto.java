package syncX.modules.SuperAdmin.Admin_interviews.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AdminInterviewDto(
        UUID scheduledId,
        String interviewId,
        LocalDate interviewDate,
        LocalTime interviewTime,
        String mode,
        String meetingLink,
        String adminNotes,
        String status,
        Integer panelSize,
        UUID candidateId,
        UUID companyId
) {}