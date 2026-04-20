package syncX.modules.auth.controller;

import syncX.modules.auth.dto.InterviewerSignupDTO;
import syncX.modules.auth.service.AuthService;
import syncX.modules.auth.dto.CandidateSignupDTO;
import syncX.modules.auth.dto.CompanySignupDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @GetMapping("/me")
    public Object getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return authService.getCurrentUser(jwt);
    }

    @PostMapping("/complete-candidate-signup")
    public String completeCandidateSignup(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CandidateSignupDTO dto) {

        authService.completeCandidateSignup(jwt, dto);
        return "Candidate created";
    }

    @PostMapping("/complete-company-signup")
    public String completeCompanySignup(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CompanySignupDTO dto) {

        authService.completeCompanySignup(jwt, dto);
        return "Company created";
    }

    @PostMapping("/complete-interviewer-signup")
    public String completeInterviewerSignup(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody InterviewerSignupDTO dto) {
        authService.completeInterviewerSignup(jwt, dto);
        return "Interviewer created";
    }
}