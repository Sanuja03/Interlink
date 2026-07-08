package syncX.modules.calendar.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import syncX.modules.calendar.dto.CalendarEventDTO;
import syncX.modules.calendar.entity.InterviewScheduled;
import syncX.modules.calendar.repository.InterviewScheduledRepository;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.repository.CandidateProfileRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CalendarService {

    private final InterviewScheduledRepository interviewScheduledRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    public CalendarService(InterviewScheduledRepository interviewScheduledRepository,
                           CandidateProfileRepository candidateProfileRepository) {
        this.interviewScheduledRepository = interviewScheduledRepository;
        this.candidateProfileRepository = candidateProfileRepository;
    }

    public List<CalendarEventDTO> getCurrentCandidateEvents(LocalDate startDate, LocalDate endDate) {
        UUID candidateId = resolveCurrentCandidateId();
        List<InterviewScheduled> events = interviewScheduledRepository.findCandidateEvents(candidateId, startDate, endDate);
        return events.stream().map(e -> mapToDTO(e, true)).collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getInterviewerEvents(UUID companyId, LocalDate startDate, LocalDate endDate) {
        List<InterviewScheduled> events = interviewScheduledRepository.findInterviewerEvents(companyId, startDate, endDate);
        return events.stream().map(e -> mapToDTO(e, false)).collect(Collectors.toList());
    }

    public List<CalendarEventDTO> getCurrentCandidateEventsByDay(LocalDate date) {
        UUID candidateId = resolveCurrentCandidateId();
        List<InterviewScheduled> events = interviewScheduledRepository.findCandidateEventsByDate(candidateId, date);
        return events.stream().map(e -> mapToDTO(e, true)).collect(Collectors.toList());
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

    private UUID resolveCurrentCandidateId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String subject = jwt.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        UUID userId;
        try {
            userId = UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        if (candidate.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return candidate.getId();
    }

    private CalendarEventDTO mapToDTO(InterviewScheduled entity, boolean isCandidate) {
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.setInterviewId(entity.getInterviewId());
        
        if (entity.getJob() != null) {
            dto.setJobTitle(entity.getJob().getTitle());
            String compName = entity.getJob().getCompany();
            if (compName == null && entity.getCompanyDetails() != null) {
                compName = entity.getCompanyDetails().getCompanyName();
            }
            dto.setCompanyName(compName);
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
        
        dto.setInterviewLocation(entity.getInterviewLocation());
        
        dto.setStatus(entity.getStatus() != null ? entity.getStatus() : "Scheduled");
        
        dto.setShowGenerateQuestions(isCandidate);
        dto.setShowJoinButton(true);
        
        return dto;
    }
}
