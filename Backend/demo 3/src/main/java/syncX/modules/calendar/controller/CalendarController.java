package syncX.modules.calendar.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.calendar.dto.CalendarEventDTO;
import syncX.modules.calendar.service.CalendarService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/candidate")
    public ResponseEntity<List<CalendarEventDTO>> getCandidateCalendar(
            @RequestParam UUID candidateId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<CalendarEventDTO> events = calendarService.getCandidateEvents(candidateId, startDate, endDate);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/interviewer")
    public ResponseEntity<List<CalendarEventDTO>> getInterviewerCalendar(
            @RequestParam UUID interviewerId, // Maps to companyId
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // The prompt says "interviewerId OR companyId". We assume interviewerId represents companyId context.
        List<CalendarEventDTO> events = calendarService.getInterviewerEvents(interviewerId, startDate, endDate);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/day")
    public ResponseEntity<List<CalendarEventDTO>> getEventsByDay(
            @RequestParam UUID userId,
            @RequestParam String role,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<CalendarEventDTO> events = calendarService.getEventsByDay(userId, role, date);
        return ResponseEntity.ok(events);
    }
}
