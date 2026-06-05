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


    // Check status for a week
    @Transactional(readOnly = true)
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


    // Get this week saved availability,status or empty array,status if not saved(pre-fill popup)
    @Transactional(readOnly = true)
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


    /**
     * INTERVIEWER: Take the logged-in interviewer’s selected days for the current week, validate
     * them, remove any old saved days for that week, save the new selected days, mark the week as
     * submitted, and return the saved result to the frontend
     */

    @Transactional
    public AvailabilityDTO.StatusResponse submitAvailability(Jwt jwt, AvailabilityDTO.SubmitRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());

        Interviewer interviewer = interviewerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found"));

        UUID companyId = interviewer.getCompanyId();
        String weekKey = request.getWeekKey();
        LocalDate weekStartDate = LocalDate.parse(request.getWeekStartDate());
        LocalDate weekEndDate = weekStartDate.plusDays(6);

        // checks the submission is for the CURRENT week by calculating the monday and comparing it to frontend recieved monday
        LocalDate todayMonday = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY);
        if (!weekStartDate.equals(todayMonday)) {
            throw new IllegalArgumentException(
                    "Availability can only be submitted for the current week. " +
                            "Expected week starting " + todayMonday + " but got " + weekStartDate);
        }

        //checks every selected data is inside the weekstartdate and weekenddate
        for (AvailabilityDTO.DayEntry entry : request.getDays()) {
            LocalDate d = LocalDate.parse(entry.getDate());
            if (d.isBefore(weekStartDate) || d.isAfter(weekEndDate)) {
                throw new IllegalArgumentException(
                        "Date " + d + " is outside week " + weekKey +
                                " (" + weekStartDate + " to " + weekEndDate + ")");
            }
        }

        //if weeklyrecord doesnt exist create one
        WeeklyAvailability wa = weeklyRepo.findByUserIdAndWeekKey(userId, weekKey)
                .orElseGet(() -> {
                    WeeklyAvailability newWa = new WeeklyAvailability();
                    newWa.setUserId(userId);
                    newWa.setCompanyId(companyId);
                    newWa.setWeekKey(weekKey);
                    newWa.setWeekStartDate(weekStartDate);
                    return newWa;
                });

        // clear old days and flush so deletes happen BEFORE inserts
        // (prevents primary-key conflicts when re-submitting the same dates)
        wa.getDays().clear();
        weeklyRepo.saveAndFlush(wa);

        //for each selectedday it creates and avalibilityday object/row
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
}




































