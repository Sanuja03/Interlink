package syncX.modules.InterviewProcess.Availability.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import syncX.modules.InterviewProcess.Availability.dto.AvailabilityDTO;
import syncX.modules.InterviewProcess.Availability.service.AvailabilityService;

@RestController
@RequestMapping("/api/interviewer/availability")
public class InterviewerAvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;


    //get submitted or not for that week
    @GetMapping("/status")
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<AvailabilityDTO.StatusResponse> getStatus(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String weekKey) {

        AvailabilityDTO.StatusResponse response =
                availabilityService.getStatus(jwt, weekKey);
        return ResponseEntity.ok(response);
    }

   //get saved avalability for this week key
    @GetMapping("/my-week")
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<AvailabilityDTO.MyWeekResponse> getMyWeek(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String weekKey) {

        AvailabilityDTO.MyWeekResponse response =
                availabilityService.getMyWeek(jwt, weekKey);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/submit")
    @PreAuthorize("hasRole('interviewer')")
    public ResponseEntity<AvailabilityDTO.StatusResponse> submitAvailability(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody AvailabilityDTO.SubmitRequest request) {

        AvailabilityDTO.StatusResponse response =
                availabilityService.submitAvailability(jwt, request);
        return ResponseEntity.ok(response);
    }
}