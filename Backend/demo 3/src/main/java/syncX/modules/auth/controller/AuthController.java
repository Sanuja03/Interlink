// ============================================================
// FILE: src/main/java/syncX/modules/auth/controller/AuthController.java (UPDATED)
// PURPOSE: Added @PreAuthorize for method-level role checks
// ============================================================
package syncX.modules.auth.controller;

import syncX.modules.auth.dto.InterviewerSignupDTO;
import syncX.modules.auth.dto.InterviewerResponseDTO;
import syncX.modules.auth.service.AuthService;
import syncX.modules.auth.dto.CandidateSignupDTO;
import syncX.modules.auth.dto.CompanySignupDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Any authenticated user can call /me
    @GetMapping("/me")
    public Object getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return authService.getCurrentUser(jwt);
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal Jwt jwt) {
        authService.logoutUser(jwt);
        return ResponseEntity.ok("Logged out");
    }

    // Public (permitAll in SecurityConfig) — called right after Supabase signup
    @PostMapping("/complete-candidate-signup")
    public String completeCandidateSignup(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CandidateSignupDTO dto) {
        authService.completeCandidateSignup(jwt, dto);
        return "Candidate created";
    }

    // Public (permitAll in SecurityConfig) — called right after Supabase signup
    @PostMapping("/complete-company-signup")
    public String completeCompanySignup(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CompanySignupDTO dto) {
        authService.completeCompanySignup(jwt, dto);
        return "Company created";
    }

    // Only company admins can create interviewers
    @PreAuthorize("hasRole('company_admin')")
    @PostMapping("/complete-interviewer-signup")
    public ResponseEntity<InterviewerResponseDTO> completeInterviewerSignup(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody InterviewerSignupDTO dto) {
        InterviewerResponseDTO created = authService.completeInterviewerSignup(jwt, dto);
        return ResponseEntity.ok(created);
    }

    // Only company admins can list interviewers
    @PreAuthorize("hasRole('company_admin')")
    @GetMapping("/interviewers")
    public ResponseEntity<List<InterviewerResponseDTO>> getInterviewers(
            @AuthenticationPrincipal Jwt jwt) {
        List<InterviewerResponseDTO> interviewers = authService.getInterviewersByCompany(jwt);
        return ResponseEntity.ok(interviewers);
    }

    // Only company admins can view specific interviewer
    @PreAuthorize("hasRole('company_admin')")
    @GetMapping("/interviewers/{interviewerId}")
    public ResponseEntity<InterviewerResponseDTO> getInterviewerById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String interviewerId) {
        InterviewerResponseDTO interviewer = authService.getInterviewerById(jwt, interviewerId);
        return ResponseEntity.ok(interviewer);
    }

    // Only company admins can deactivate interviewers
    @PreAuthorize("hasRole('company_admin')")
    @PutMapping("/interviewers/{interviewerId}/deactivate")
    public ResponseEntity<String> deactivateInterviewer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String interviewerId) {
        authService.deactivateInterviewer(jwt, interviewerId);
        return ResponseEntity.ok("Interviewer deactivated");
    }

    @PreAuthorize("hasRole('company_admin')")
    @PutMapping("/interviewers/{interviewerId}/activate")
    public ResponseEntity<String> activateInterviewer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String interviewerId) {
        authService.activateInterviewer(jwt, interviewerId);
        return ResponseEntity.ok("Interviewer activated");
    }
}