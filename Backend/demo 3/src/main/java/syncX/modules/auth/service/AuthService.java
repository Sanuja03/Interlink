package syncX.modules.auth.service;

import syncX.modules.auth.dto.CandidateSignupDTO;
import syncX.modules.auth.dto.CompanySignupDTO;
import syncX.modules.auth.dto.InterviewerSignupDTO;
import syncX.modules.auth.dto.InterviewerResponseDTO;
import syncX.modules.auth.entity.Candidate;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.entity.Interviewer;
import syncX.modules.auth.entity.User;
import syncX.modules.auth.repository.InterviewerRepository;
import syncX.modules.auth.repository.UserRepository;
import syncX.modules.auth.repository.CandidateRepository;
import syncX.modules.auth.repository.CompanyRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private InterviewerRepository interviewerRepository;

    @Autowired
    private SupabaseAdminService supabaseAdminService;

    // ── UPDATED: clears isFirstLogin on first access & updates lastLoginAt ──
    public Object getCurrentUser(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OffsetDateTime now = OffsetDateTime.now();
        boolean changed = false;

        // Clear first login flag when user actually logs in / calls /me
        if (Boolean.TRUE.equals(user.getIsFirstLogin())) {
            user.setIsFirstLogin(false);
            changed = true;
        }

        // Always update last login timestamp
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user);

        return user;
    }

    public void completeCandidateSignup(Jwt jwt, CandidateSignupDTO dto) {
        UUID userId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User user = userRepository.findById(userId).orElseGet(User::new);
        user.setUserId(userId);
        user.setEmail(dto.getEmail());
        user.setRole("candidate");
        user.setAccountStatus("active");
        user.setIsFirstLogin(true);
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(now);
        }
        user.setUpdatedAt(now);
        userRepository.save(user);

        Candidate candidate = new Candidate();
        candidate.setCandidateId(UUID.randomUUID());
        candidate.setUserId(userId);
        candidate.setFirstName(dto.getFirstName());
        candidate.setLastName(dto.getLastName());
        candidate.setEmail(dto.getEmail());
        candidate.setCreatedAt(now);

        candidateRepository.save(candidate);
    }

    public void completeCompanySignup(Jwt jwt, CompanySignupDTO dto) {
        UUID userId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User user = userRepository.findById(userId).orElseGet(User::new);
        user.setUserId(userId);
        user.setEmail(dto.getEmail());
        user.setRole("company_admin");
        user.setAccountStatus("active");
        user.setIsFirstLogin(true);
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(now);
        }
        user.setUpdatedAt(now);
        userRepository.save(user);

        Company company = new Company();
        company.setCompanyId(UUID.randomUUID());
        company.setUserId(userId);
        company.setCompanyName(dto.getCompanyName());
        company.setCompanyEmail(dto.getEmail());
        company.setIndustry(dto.getIndustry());
        company.setCompanySize(dto.getCompanySize());
        company.setCreatedAt(now);
        company.setUpdatedAt(now);

        companyRepository.save(company);
    }

    public InterviewerResponseDTO completeInterviewerSignup(Jwt jwt, InterviewerSignupDTO dto) {

        UUID adminUserId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        // 1. Verify admin
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can create interviewers");
        }

        // Get company
        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists in system");
        }

        // CREATE USER IN SUPABASE
        String supabaseUserId = supabaseAdminService.createUser(
                dto.getEmail(),
                dto.getPassword()
        );

        UUID interviewerUserId = UUID.fromString(supabaseUserId);

        // SAVE INTO USERS TABLE
        User user = new User();
        user.setUserId(interviewerUserId);
        user.setEmail(dto.getEmail());
        user.setRole("interviewer");
        user.setAccountStatus("active");
        user.setIsFirstLogin(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        userRepository.save(user);

        // SAVE INTO INTERVIEWERS TABLE
        Interviewer interviewer = new Interviewer();
        interviewer.setInterviewerId(dto.getInterviewerId());
        interviewer.setUserId(interviewerUserId);
        interviewer.setCompanyId(adminCompany.getCompanyId());

        interviewer.setFullName(dto.getFullName());
        interviewer.setPhone(dto.getPhone());
        interviewer.setInterviewerRole(dto.getInterviewerRole());
        interviewer.setBranch(dto.getBranch());

        interviewer.setAddress(dto.getAddress());
        interviewer.setAbout(dto.getAbout());
        interviewer.setEmail(dto.getEmail());

        interviewer.setCreatedAt(now);
        interviewer.setUpdatedAt(now);

        interviewerRepository.save(interviewer);

        // Return the created interviewer details
        return mapToResponseDTO(interviewer, user);
    }

    // ── Fetch all interviewers for the admin's company ──
    public List<InterviewerResponseDTO> getInterviewersByCompany(Jwt jwt) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can view interviewers");
        }

        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        List<Interviewer> interviewers = interviewerRepository.findByCompanyId(adminCompany.getCompanyId());

        return interviewers.stream()
                .map(interviewer -> {
                    User user = userRepository.findById(interviewer.getUserId()).orElse(null);
                    return mapToResponseDTO(interviewer, user);
                })
                .collect(Collectors.toList());
    }

    // ── Fetch single interviewer by interviewer_id ──
    public InterviewerResponseDTO getInterviewerById(Jwt jwt, String interviewerId) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can view interviewers");
        }

        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Interviewer interviewer = interviewerRepository.findById(interviewerId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found"));

        // Make sure this interviewer belongs to the admin's company
        if (!interviewer.getCompanyId().equals(adminCompany.getCompanyId())) {
            throw new RuntimeException("Interviewer does not belong to your company");
        }

        User user = userRepository.findById(interviewer.getUserId()).orElse(null);
        return mapToResponseDTO(interviewer, user);
    }

    // ── NEW: Deactivate an interviewer account ──
    public void deactivateInterviewer(Jwt jwt, String interviewerId) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        // Verify admin
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can deactivate interviewers");
        }

        // Get admin's company
        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Find the interviewer
        Interviewer interviewer = interviewerRepository.findById(interviewerId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found"));

        // Ensure interviewer belongs to admin's company
        if (!interviewer.getCompanyId().equals(adminCompany.getCompanyId())) {
            throw new RuntimeException("Interviewer does not belong to your company");
        }

        // Update account_status in the users table to "inactive"
        User interviewerUser = userRepository.findById(interviewer.getUserId())
                .orElseThrow(() -> new RuntimeException("Interviewer user account not found"));

        interviewerUser.setAccountStatus("inactive");
        interviewerUser.setUpdatedAt(now);
        userRepository.save(interviewerUser);
    }

    // ── Helper: map entity to response DTO ──
    private InterviewerResponseDTO mapToResponseDTO(Interviewer interviewer, User user) {
        InterviewerResponseDTO response = new InterviewerResponseDTO();
        response.setInterviewerId(interviewer.getInterviewerId());
        response.setUserId(interviewer.getUserId());
        response.setCompanyId(interviewer.getCompanyId());
        response.setFullName(interviewer.getFullName());
        response.setPhone(interviewer.getPhone());
        response.setInterviewerRole(interviewer.getInterviewerRole());
        response.setBranch(interviewer.getBranch());
        response.setAddress(interviewer.getAddress());
        response.setAbout(interviewer.getAbout());
        response.setPhotoUrl(interviewer.getPhotoUrl());
        response.setCreatedAt(interviewer.getCreatedAt());
        response.setUpdatedAt(interviewer.getUpdatedAt());

        if (user != null) {
            response.setEmail(user.getEmail());
            response.setAccountStatus(user.getAccountStatus());
            response.setFirstLogin(user.getIsFirstLogin());
        }

        return response;
    }
}