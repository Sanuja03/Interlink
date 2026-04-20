package syncX.modules.auth.service;

import syncX.modules.auth.dto.CandidateSignupDTO;
import syncX.modules.auth.dto.CompanySignupDTO;
import syncX.modules.auth.dto.InterviewerSignupDTO;
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
import java.util.UUID;

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

    public Object getCurrentUser(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
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

    public void completeInterviewerSignup(Jwt jwt, InterviewerSignupDTO dto) {
        UUID adminUserId = UUID.fromString(jwt.getSubject());
        OffsetDateTime now = OffsetDateTime.now();

        // verify caller is company_admin
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (!admin.getRole().equals("company_admin")) {
            throw new RuntimeException("Only company admins can create interviewers");
        }

        // get admin's company automatically - company_id comes from here
        Company adminCompany = companyRepository.findByUserId(adminUserId)
                .orElseThrow(() -> new RuntimeException("Company not found for this admin"));

        UUID interviewerUserId = dto.getUserId();

        // insert into users table
        User user = userRepository.findById(interviewerUserId).orElseGet(User::new);
        user.setUserId(interviewerUserId);
        user.setEmail(dto.getEmail());
        user.setRole("interviewer");
        user.setAccountStatus("active");
        user.setIsFirstLogin(true);
        if (user.getCreatedAt() == null) user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user);

        // insert into interviewers table
        Interviewer interviewer = new Interviewer();
        interviewer.setInterviewerId(UUID.randomUUID());
        interviewer.setUserId(interviewerUserId);
        interviewer.setCompanyId(adminCompany.getCompanyId());
        interviewer.setFullName(dto.getFullName());
        interviewer.setPhone(dto.getPhone());
        interviewer.setInterviewerRole(dto.getInterviewerRole());
        interviewer.setBranch(dto.getBranch());
        interviewer.setCreatedAt(now);
        interviewer.setUpdatedAt(now);
        interviewerRepository.save(interviewer);
    }
}