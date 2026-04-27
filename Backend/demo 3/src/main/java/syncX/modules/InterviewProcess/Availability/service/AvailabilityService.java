package syncX.modules.InterviewProcess.Availability.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.InterviewProcess.Availability.dto.AvailabilityDTO;
import syncX.modules.InterviewProcess.Availability.entity.AvailabilityDay;
import syncX.modules.InterviewProcess.Availability.entity.WeeklyAvailability;
import syncX.modules.InterviewProcess.Availability.repository.AvailabilityDayRepository;
import syncX.modules.InterviewProcess.Availability.repository.WeeklyAvailabilityRepository;

import syncX.modules.auth.entity.Company;
import syncX.modules.auth.entity.Interviewer;
import syncX.modules.auth.repository.CompanyRepository;
import syncX.modules.auth.repository.InterviewerRepository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    @Autowired
    private WeeklyAvailabilityRepository weeklyRepo;

    @Autowired
    private AvailabilityDayRepository dayRepo;

    @Autowired
    private InterviewerRepository interviewerRepository;

    @Autowired
    private CompanyRepository companyRepository;

    // ─────────────────────────────────────────
    // INTERVIEWER: Check status for a week
    // ─────────────────────────────────────────

    public AvailabilityDTO.StatusResponse getStatus(Jwt jwt, String weekKey) {
        UUID userId = UUID.fromString(jwt.getSubject());

        Optional<WeeklyAvailability> opt = weeklyRepo.findByUserIdAndWeekKey(userId, weekKey);

        if (opt.isEmpty()) {
            return new AvailabilityDTO.StatusResponse(false, List.of());
        }

        WeeklyAvailability wa = opt.get();
        boolean submitted = "submitted".equals(wa.getStatus());

        List<String> days = wa.getDays().stream()
                .filter(AvailabilityDay::isAvailable)
                .map(d -> d.getAvailableDate().toString())
                .collect(Collectors.toList());

        return new AvailabilityDTO.StatusResponse(submitted, days);
    }

    // ─────────────────────────────────────────
    // INTERVIEWER: Get my week (pre-fill popup)
    // ─────────────────────────────────────────

    public AvailabilityDTO.MyWeekResponse getMyWeek(Jwt jwt, String weekKey) {
        UUID userId = UUID.fromString(jwt.getSubject());

        Optional<WeeklyAvailability> opt = weeklyRepo.findByUserIdAndWeekKey(userId, weekKey);

        if (opt.isEmpty()) {
            return new AvailabilityDTO.MyWeekResponse(weekKey, "pending", List.of());
        }

        WeeklyAvailability wa = opt.get();
        List<String> days = wa.getDays().stream()
                .filter(AvailabilityDay::isAvailable)
                .map(d -> d.getAvailableDate().toString())
                .collect(Collectors.toList());

        return new AvailabilityDTO.MyWeekResponse(wa.getWeekKey(), wa.getStatus(), days);
    }

    // ─────────────────────────────────────────
    // INTERVIEWER: Submit availability
    // ─────────────────────────────────────────

    @Transactional
    public AvailabilityDTO.StatusResponse submitAvailability(Jwt jwt, AvailabilityDTO.SubmitRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());

        Interviewer interviewer = interviewerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found"));

        UUID companyId = interviewer.getCompanyId();
        String weekKey = request.getWeekKey();
        LocalDate weekStartDate = LocalDate.parse(request.getWeekStartDate());
        LocalDate weekEndDate = weekStartDate.plusDays(6);

        // ── Server-side: enforce that the submission is for the CURRENT week only
        LocalDate todayMonday = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY);
        if (!weekStartDate.equals(todayMonday)) {
            throw new IllegalArgumentException(
                    "Availability can only be submitted for the current week. " +
                            "Expected week starting " + todayMonday + " but got " + weekStartDate);
        }

        // ── Validate every submitted date falls within the declared week
        for (AvailabilityDTO.DayEntry entry : request.getDays()) {
            LocalDate d = LocalDate.parse(entry.getDate());
            if (d.isBefore(weekStartDate) || d.isAfter(weekEndDate)) {
                throw new IllegalArgumentException(
                        "Date " + d + " is outside week " + weekKey +
                                " (" + weekStartDate + " to " + weekEndDate + ")");
            }
        }

        WeeklyAvailability wa = weeklyRepo.findByUserIdAndWeekKey(userId, weekKey)
                .orElseGet(() -> {
                    WeeklyAvailability newWa = new WeeklyAvailability();
                    newWa.setUserId(userId);
                    newWa.setCompanyId(companyId);
                    newWa.setWeekKey(weekKey);
                    newWa.setWeekStartDate(weekStartDate);
                    return newWa;
                });

        wa.getDays().clear();

        for (AvailabilityDTO.DayEntry entry : request.getDays()) {
            AvailabilityDay day = new AvailabilityDay();
            day.setWeeklyAvailability(wa);
            day.setAvailableDate(LocalDate.parse(entry.getDate()));
            day.setDayName(entry.getDayName());
            day.setAvailable(true);
            wa.getDays().add(day);
        }

        wa.setStatus("submitted");
        wa.setSubmittedAt(OffsetDateTime.now());

        weeklyRepo.save(wa);

        List<String> savedDays = wa.getDays().stream()
                .map(d -> d.getAvailableDate().toString())
                .collect(Collectors.toList());

        return new AvailabilityDTO.StatusResponse(true, savedDays);
    }
    // ─────────────────────────────────────────
    // COMPANY ADMIN: All interviewers for a week
    // ─────────────────────────────────────────

    public List<AvailabilityDTO.InterviewerWeekSummary> getCompanyWeekAvailability(
            Jwt jwt, String weekKey) {

        UUID adminUserId = UUID.fromString(jwt.getSubject());

        // Get admin's company
        Company company = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        UUID companyId = company.getCompanyId();

        // Get all submitted availability for this company + week
        List<WeeklyAvailability> records =
                weeklyRepo.findByCompanyIdAndWeekKeyAndStatus(companyId, weekKey, "submitted");

        List<AvailabilityDTO.InterviewerWeekSummary> result = new ArrayList<>();

        for (WeeklyAvailability wa : records) {
            // Get interviewer details using your existing repository
            Interviewer interviewer = interviewerRepository.findByUserId(wa.getUserId())
                    .orElse(null);

            if (interviewer == null) continue;

            AvailabilityDTO.InterviewerWeekSummary summary = new AvailabilityDTO.InterviewerWeekSummary();
            summary.setUserId(wa.getUserId().toString());
            summary.setInterviewerId(interviewer.getInterviewerId());
            summary.setFullName(interviewer.getFullName());
            summary.setRole(interviewer.getInterviewerRole());
            summary.setBranch(interviewer.getBranch());
            summary.setStatus(wa.getStatus());

            List<String> days = wa.getDays().stream()
                    .filter(AvailabilityDay::isAvailable)
                    .map(d -> d.getAvailableDate().toString())
                    .collect(Collectors.toList());
            summary.setAvailableDays(days);

            result.add(summary);
        }

        return result;
    }

    // ─────────────────────────────────────────
    // COMPANY ADMIN: Interviewers available on a date
    // ─────────────────────────────────────────

    public List<AvailabilityDTO.InterviewerDateEntry> getAvailableOnDate(
            Jwt jwt, String dateStr) {

        UUID adminUserId = UUID.fromString(jwt.getSubject());
        LocalDate date = LocalDate.parse(dateStr);

        Company company = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        UUID companyId = company.getCompanyId();

        // ── The Monday of the week this date belongs to
        LocalDate weekStartForDate = date.with(java.time.DayOfWeek.MONDAY);

        List<AvailabilityDay> availDays =
                dayRepo.findAvailableByDateAndCompanyAndWeek(date, companyId, weekStartForDate);

        List<AvailabilityDTO.InterviewerDateEntry> result = new ArrayList<>();

        for (AvailabilityDay ad : availDays) {
            UUID interviewerUserId = ad.getWeeklyAvailability().getUserId();

            Interviewer interviewer = interviewerRepository.findByUserId(interviewerUserId)
                    .orElse(null);

            if (interviewer == null) continue;

            result.add(new AvailabilityDTO.InterviewerDateEntry(
                    interviewerUserId.toString(),
                    interviewer.getInterviewerId(),
                    interviewer.getFullName(),
                    interviewer.getInterviewerRole(),
                    interviewer.getBranch()
            ));
        }

        return result;
    }
}