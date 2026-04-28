package syncX.modules.calendar.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/candidate/me")
    public ResponseEntity<?> getCandidateCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<CalendarEventDTO> events = calendarService.getCurrentCandidateEvents(startDate, endDate);
            return ResponseEntity.ok(events);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(java.util.Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error fetching candidate calendar: " + e.getMessage()));
        }
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
    public ResponseEntity<?> getEventsByDay(
            @RequestParam(required = false) UUID userId,
            @RequestParam String role,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            if ("CANDIDATE".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(calendarService.getCurrentCandidateEventsByDay(date));
            }
            List<CalendarEventDTO> events = calendarService.getEventsByDay(userId, role, date);
            return ResponseEntity.ok(events);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(java.util.Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error fetching calendar events: " + e.getMessage()));
        }
    }
}
