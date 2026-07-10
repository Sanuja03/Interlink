package syncX.modules.auth.service;

import syncX.modules.auth.dto.CandidateSignupDTO;
import syncX.modules.auth.dto.CompanySignupDTO;
import syncX.modules.auth.dto.InterviewerSignupDTO;
import syncX.modules.auth.dto.InterviewerResponseDTO;
import syncX.modules.auth.dto.InterviewerUpdateDTO;
import syncX.modules.auth.entity.Candidate;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.entity.Interviewer;
import syncX.modules.auth.entity.User;
import syncX.modules.auth.exception.AccountSuspendedException;
import syncX.modules.auth.repository.InterviewerRepository;
import syncX.modules.auth.repository.UserRepository;
import syncX.modules.auth.repository.CandidateRepository;
import syncX.modules.auth.repository.CompanyRepository;
// ── ADDED ──
import syncX.modules.subscription.entity.ActiveSubscription;
import syncX.modules.subscription.entity.SubscriptionPlan;
import syncX.modules.subscription.repository.ActiveSubscriptionRepository;
// ── END ADDED ──

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
    private InterviewerPersistenceService interviewerPersistenceService;

    @Autowired
    private SupabaseAdminService supabaseAdminService;

    // ── ADDED ──
    @Autowired
    private ActiveSubscriptionRepository activeSubscriptionRepository;
    // ── END ADDED ──

    // clears isFirstLogin on first access & updates lastLoginAt
    public Object getCurrentUser(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("suspended".equals(user.getAccountStatus())) {
            throw new AccountSuspendedException("Your account has been suspended. Please contact support.");
        }

        OffsetDateTime now = OffsetDateTime.now();

        if (Boolean.TRUE.equals(user.getIsFirstLogin())) {
            user.setIsFirstLogin(false);
        }

        user.setAccountStatus("active");
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user);

        return user;
    }

    public void logoutUser(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAccountStatus("inactive");
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);
    }

    public void completeCandidateSignup(Jwt jwt, CandidateSignupDTO dto) {
        UUID userId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User user = userRepository.findById(userId).orElseGet(User::new);
        user.setUserId(userId);
        user.setEmail(dto.getEmail());
        user.setRole("candidate");
        user.setAccountStatus("inactive");
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
        user.setAccountStatus("inactive");
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

    //creates a new interviewer account and returns the details
    public InterviewerResponseDTO completeInterviewerSignup(Jwt jwt, InterviewerSignupDTO dto) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can create interviewers");
        }

        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // ── ADDED: Backend interviewer limit check ──
        UUID companyId = adminCompany.getCompanyId();

        ActiveSubscription sub = activeSubscriptionRepository
                .findByCompanyId(companyId)
                .orElse(null);

        if (sub != null) {
            SubscriptionPlan plan = sub.getPlan();
            Integer interviewerLimit = plan.getInterviewers();

            if (interviewerLimit != null && interviewerLimit > 0) {
                long currentCount = interviewerRepository.countByCompanyId(companyId);
                if (currentCount >= interviewerLimit) {
                    throw new RuntimeException(
                            "Interviewer limit reached. Your " + plan.getName() +
                                    " plan allows " + interviewerLimit + " interviewer accounts."
                    );
                }
            }
        }
        // ── END ADDED ──

        // ── Employee ID must be present ──
        if (dto.getInterviewerId() == null || dto.getInterviewerId().isBlank()) {
            throw new RuntimeException("Employee ID is required");
        }
        String employeeId = dto.getInterviewerId().trim();

        // ── Employee ID must be unique WITHIN this company (not globally) ──
        if (interviewerRepository.existsByCompanyIdAndInterviewerId(
                adminCompany.getCompanyId(), employeeId)) {
            throw new RuntimeException(
                    "An interviewer with Employee ID '" + employeeId
                            + "' already exists in your company.");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists in system");
        }

        String supabaseUserId = supabaseAdminService.createUser(
                dto.getEmail(),
                dto.getPassword()
        );

        UUID interviewerUserId = UUID.fromString(supabaseUserId);

        try {
            interviewerPersistenceService.persist(
                    dto, interviewerUserId, adminCompany, employeeId, now);
        } catch (RuntimeException ex) {
            try {
                supabaseAdminService.deleteUser(supabaseUserId);
            } catch (Exception cleanupEx) {
                System.err.println("[completeInterviewerSignup] Failed to clean up "
                        + "Supabase user " + supabaseUserId + " after DB failure: "
                        + cleanupEx.getMessage());
            }
            throw ex;
        }

        User user = userRepository.findById(interviewerUserId)
                .orElseThrow(() -> new RuntimeException("User not found after creation"));
        Interviewer interviewer = interviewerRepository.findByUserId(interviewerUserId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found after creation"));

        return mapToResponseDTO(interviewer, user);
    }

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

    public InterviewerResponseDTO getInterviewerById(Jwt jwt, String interviewerId) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can view interviewers");
        }

        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Interviewer interviewer = interviewerRepository
                .findByCompanyIdAndInterviewerId(adminCompany.getCompanyId(), interviewerId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found in your company"));

        User user = userRepository.findById(interviewer.getUserId()).orElse(null);
        return mapToResponseDTO(interviewer, user);
    }

    public void deactivateInterviewer(Jwt jwt, String interviewerId) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can deactivate interviewers");
        }

        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Interviewer interviewer = interviewerRepository
                .findByCompanyIdAndInterviewerId(adminCompany.getCompanyId(), interviewerId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found in your company"));

        User interviewerUser = userRepository.findById(interviewer.getUserId())
                .orElseThrow(() -> new RuntimeException("Interviewer user account not found"));

        interviewerUser.setAccountStatus("suspended");
        interviewerUser.setUpdatedAt(now);
        userRepository.save(interviewerUser);
    }

    public void activateInterviewer(Jwt jwt, String interviewerId) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can activate interviewers");
        }

        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Interviewer interviewer = interviewerRepository
                .findByCompanyIdAndInterviewerId(adminCompany.getCompanyId(), interviewerId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found in your company"));

        User interviewerUser = userRepository.findById(interviewer.getUserId())
                .orElseThrow(() -> new RuntimeException("Interviewer user account not found"));

        interviewerUser.setAccountStatus("inactive");
        interviewerUser.setUpdatedAt(now);
        userRepository.save(interviewerUser);
    }

    // Interviewer self-profile methods

    public InterviewerResponseDTO getInterviewerOwnProfile(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Interviewer interviewer = interviewerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Interviewer profile not found"));

        return mapToResponseDTO(interviewer, user);
    }

    public InterviewerResponseDTO updateInterviewerOwnProfile(Jwt jwt, InterviewerUpdateDTO dto) {
        UUID userId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Interviewer interviewer = interviewerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Interviewer profile not found"));

        if (dto.getInterviewerRole() != null) {
            interviewer.setInterviewerRole(dto.getInterviewerRole());
        }
        if (dto.getBranch() != null) {
            interviewer.setBranch(dto.getBranch());
        }
        if (dto.getAddress() != null) {
            interviewer.setAddress(dto.getAddress());
        }
        if (dto.getAbout() != null) {
            interviewer.setAbout(dto.getAbout());
        }

        interviewer.setUpdatedAt(now);
        interviewerRepository.save(interviewer);

        return mapToResponseDTO(interviewer, user);
    }

    //Updates only the interviewer's photo URL.
    public InterviewerResponseDTO updateInterviewerPhoto(Jwt jwt, String photoUrl) {
        UUID userId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Interviewer interviewer = interviewerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Interviewer profile not found"));

        interviewer.setPhotoUrl(photoUrl);
        interviewer.setUpdatedAt(now);
        interviewerRepository.save(interviewer);

        return mapToResponseDTO(interviewer, user);
    }

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