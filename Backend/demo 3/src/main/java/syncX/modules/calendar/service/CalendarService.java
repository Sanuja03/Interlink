package syncX.modules.calendar.service;

import org.springframework.stereotype.Service;
import syncX.modules.calendar.dto.CalendarEventDTO;
import syncX.modules.calendar.entity.InterviewScheduled;
import syncX.modules.calendar.repository.InterviewScheduledRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CalendarService {

    private final InterviewScheduledRepository interviewScheduledRepository;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    public CalendarService(InterviewScheduledRepository interviewScheduledRepository) {
        this.interviewScheduledRepository = interviewScheduledRepository;
    }

    public List<CalendarEventDTO> getCandidateEvents(UUID candidateId, LocalDate startDate, LocalDate endDate) {
        List<InterviewScheduled> events = interviewScheduledRepository.findCandidateEvents(candidateId, startDate, endDate);
        return events.stream().map(e -> mapToDTO(e, true)).collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getInterviewerEvents(UUID companyId, LocalDate startDate, LocalDate endDate) {
        List<InterviewScheduled> events = interviewScheduledRepository.findInterviewerEvents(companyId, startDate, endDate);
        return events.stream().map(e -> mapToDTO(e, false)).collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getEventsByDay(UUID userId, String role, LocalDate date) {
        List<InterviewScheduled> events;
        boolean isCandidate = "CANDIDATE".equalsIgnoreCase(role);
        
        if (isCandidate) {
            events = interviewScheduledRepository.findCandidateEventsByDate(userId, date);
        } else {
            // Assume userId here means companyId for interviewer view based on DB schema
            events = interviewScheduledRepository.findInterviewerEventsByDate(userId, date);
        }
        
        return events.stream().map(e -> mapToDTO(e, isCandidate)).collect(Collectors.toList());
    }

    private CalendarEventDTO mapToDTO(InterviewScheduled entity, boolean isCandidate) {
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.setInterviewId(entity.getInterviewId());
        
        if (entity.getJob() != null) {
            dto.setJobTitle(entity.getJob().getTitle());
            dto.setCompanyName(entity.getJob().getCompany());
        }
        
        if (entity.getInterviewDate() != null) {
            dto.setDate(entity.getInterviewDate().toString());
        }
        
        if (entity.getInterviewTime() != null) {
            dto.setTime(entity.getInterviewTime().format(TIME_FORMATTER));
            dto.setEndTime(entity.getInterviewTime().plusMinutes(30).format(TIME_FORMATTER));
        }
        
        dto.setMode(entity.getMode());
        
        if ("Online".equalsIgnoreCase(entity.getMode()) || "Online Interview".equalsIgnoreCase(entity.getMode())) {
            dto.setMeetingLink(entity.getMeetingLink());
        }
        
        dto.setStatus(entity.getStatus() != null ? entity.getStatus() : "Scheduled");
        
        dto.setShowGenerateQuestions(isCandidate);
        dto.setShowJoinButton(true);
        
        return dto;
    }
}
