package syncX.modules.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.auth.dto.InterviewerSignupDTO;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.entity.Interviewer;
import syncX.modules.auth.entity.User;
import syncX.modules.auth.repository.InterviewerRepository;
import syncX.modules.auth.repository.UserRepository;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Persists the users + interviewers rows for a new interviewer as ONE unit.
 *
 * This lives in its own bean (not inside AuthService) on purpose: Spring's
 * @Transactional is applied through a proxy, and a method calling another
 * method *within the same class* bypasses that proxy — so the transaction
 * wouldn't actually start. Calling it as a separate injected bean makes the
 * transaction real.
 *
 * If the interviewers insert fails (e.g. the per-company unique constraint
 * fires under a race), the users insert is rolled back with it — you never get
 * a users row without a matching interviewers row.
 */
@Service
public class InterviewerPersistenceService {

    @Autowired private UserRepository userRepository;
    @Autowired private InterviewerRepository interviewerRepository;

    @Transactional
    public void persist(InterviewerSignupDTO dto, UUID interviewerUserId,
                        Company adminCompany, String employeeId, OffsetDateTime now) {

        User user = new User();
        user.setUserId(interviewerUserId);
        user.setEmail(dto.getEmail());
        user.setRole("interviewer");
        user.setAccountStatus("inactive");
        user.setIsFirstLogin(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user);

        Interviewer interviewer = new Interviewer();
        interviewer.setInterviewerId(employeeId);
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
    }
}