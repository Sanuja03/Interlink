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

    // clears isFirstLogin on first access & updates lastLoginAt
    public Object getCurrentUser(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("suspended".equals(user.getAccountStatus())) {
            throw new AccountSuspendedException("Your account has been suspended. Please contact support.");
        }

        OffsetDateTime now = OffsetDateTime.now(); //get current time

        //if first time logging in set it to false
        if (Boolean.TRUE.equals(user.getIsFirstLogin())) {
            user.setIsFirstLogin(false);
        }

        user.setAccountStatus("active");
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user); //update teh database with the updated details such as lastlogin etc

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
        candidate.setFirstName(dto.getFirstName());//these are wat given by the frontend
        candidate.setLastName(dto.getLastName());
        candidate.setEmail(dto.getEmail());
        candidate.setCreatedAt(now);

        candidateRepository.save(candidate);
    }

    public void completeCompanySignup(Jwt jwt, CompanySignupDTO dto) {
        UUID userId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        User user = userRepository.findById(userId).orElseGet(User::new);//try to find the user by user id and if not found create a new user
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
        //get the logged in user's(companyadmin) userid
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();//Get current date and time

        //find the logged in user(companyadmin) in database using user id
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can create interviewers");
        }

        //check whether  this userid has a companyid in company table
        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // ── Employee ID must be present ──
        if (dto.getInterviewerId() == null || dto.getInterviewerId().isBlank()) {
            throw new RuntimeException("Employee ID is required");
        }
        String employeeId = dto.getInterviewerId().trim();

        // ── Employee ID must be unique WITHIN this company (not globally) ──
        // Two different companies may reuse the same ID; we only block a
        // collision inside the admin's own company. Checked BEFORE creating the
        // Supabase auth user so a duplicate never leaves an orphaned account.
        if (interviewerRepository.existsByCompanyIdAndInterviewerId(
                adminCompany.getCompanyId(), employeeId)) {
            throw new RuntimeException(
                    "An interviewer with Employee ID '" + employeeId
                            + "' already exists in your company.");
        }

        //Check email already exists give for the interviewer
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists in system");
        }

        //create the supabase auth.user
        String supabaseUserId = supabaseAdminService.createUser(
                dto.getEmail(),
                dto.getPassword()
        );

        UUID interviewerUserId = UUID.fromString(supabaseUserId);

        // ── Consistency guard ──────────────────────────────────────────────
        // Supabase auth user is created first (external system — @Transactional
        // can't roll it back). The two DB writes run together inside
        // interviewerPersistenceService.persist(...) which IS transactional, so
        // they succeed or fail as one: never a users row without an interviewers
        // row. If that DB unit fails for any reason, we delete the Supabase user
        // so no orphaned auth account is left behind (the bug seen before).
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

        // Re-read the freshly committed rows for the response DTO.
        User user = userRepository.findById(interviewerUserId)
                .orElseThrow(() -> new RuntimeException("User not found after creation"));
        Interviewer interviewer = interviewerRepository.findByUserId(interviewerUserId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found after creation"));

        return mapToResponseDTO(interviewer, user);//Convert data into a clean response and send back to frontend
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

        //interviewer objects will be convert to a response dto and then returned as a list
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

        // Emp ID is unique only within a company, so resolve it together with
        // the admin's company. This also inherently enforces ownership.
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

    //  map entity to response DTO - combines interviewer and user object and give oen to front end
    private InterviewerResponseDTO mapToResponseDTO(Interviewer interviewer, User user) {
        InterviewerResponseDTO response = new InterviewerResponseDTO();
        response.setInterviewerId(interviewer.getInterviewerId());
        response.setUserId(interviewer.getUserId());
        response.setCompanyId(interviewer.getCompanyId());
        response.setFullName(interviewer.getFullName());//get full name from the interviewer object and put it into the response object
        response.setPhone(interviewer.getPhone());
        response.setInterviewerRole(interviewer.getInterviewerRole());
        response.setBranch(interviewer.getBranch());
        response.setAddress(interviewer.getAddress());
        response.setAbout(interviewer.getAbout());
        response.setPhotoUrl(interviewer.getPhotoUrl());
        response.setCreatedAt(interviewer.getCreatedAt());
        response.setUpdatedAt(interviewer.getUpdatedAt());

        if (user != null) {
            //copy account/login-related details from the User object into the response.
            response.setEmail(user.getEmail());
            response.setAccountStatus(user.getAccountStatus());
            response.setFirstLogin(user.getIsFirstLogin());
        }

        return response;
    }
}