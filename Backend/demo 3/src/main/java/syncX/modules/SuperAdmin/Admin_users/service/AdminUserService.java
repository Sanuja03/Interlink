package syncX.modules.SuperAdmin.Admin_users.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import syncX.modules.SuperAdmin.Admin_users.dto.*;
import syncX.modules.SuperAdmin.Admin_users.entity.*;
import syncX.modules.SuperAdmin.Admin_users.repository.*;

import syncX.modules.SuperAdmin.Admin_activities.entity.ActivityLog;
import syncX.modules.SuperAdmin.Admin_activities.repository.ActivityLogRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final AdminUserRepository userRepo;
    private final AdminCandidateRepository candidateRepo;
    private final AdminInterviewerRepository interviewerRepo;
    private final AdminCandidateSkillsRepository skillsRepo;
    private final AdminCandidateStatsRepository candidateStatsRepo;
    private final AdminCandidateInterviewRequestRepository candidateInterviewRequestRepo; // for candidate stats only
    private final AdminInterviewRequestInterviewerRepository interviewerRequestRepo;      // for interviewer stats
    private final AdminInterviewerAvailabilityDayRepository availabilityRepo;
    private final ActivityLogRepository activityLogRepo;

    // ================================================
    // 🔹 LIST ALL USERS
    // ================================================
    public List<AdminUsersListDto> getAllUsers(String search, String role) {
        List<AdminUser> users = userRepo.searchUsers(role, search);

        return users.stream().map(user -> {
            String name = resolveDisplayName(user);
            return new AdminUsersListDto(
                    user.getUserId(),
                    name,
                    user.getEmail(),
                    user.getRole(),
                    user.getAccountStatus()
            );
        }).collect(Collectors.toList());
    }

    private String resolveDisplayName(AdminUser user) {
        try {
            return switch (user.getRole().toLowerCase()) {
                case "candidate" -> candidateRepo.findByUserId(user.getUserId())
                        .map(c -> c.getFirstName() + " " + c.getLastName())
                        .orElse(user.getEmail());
                case "interviewer" -> interviewerRepo.findById(user.getUserId())
                        .map(AdminInterviewer::getEmail)
                        .orElse(user.getEmail());
                default -> user.getEmail();
            };
        } catch (Exception e) {
            return user.getEmail();
        }
    }

    // ================================================
    // 🔹 GET PROFILE (routes by role)
    // ================================================
    public Object getUserProfile(UUID userId) {
        AdminUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return switch (user.getRole().toLowerCase()) {
            case "candidate"     -> buildCandidateProfile(user);
            case "interviewer"   -> buildInterviewerProfile(user);
            case "company_admin" -> buildCompanyAdminProfile(user);
            default -> throw new RuntimeException("Unsupported role: " + user.getRole());
        };
    }

    // ================================================
    // 🔹 CANDIDATE PROFILE
    // ================================================
    private AdminCandidateProfileDto buildCandidateProfile(AdminUser user) {
        AdminCandidate candidate = candidateRepo.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        UUID candidateId = candidate.getCandidateId();

        List<Long> skills = skillsRepo.findByCandidateId(candidateId)
                .stream()
                .map(AdminCandidateSkill::getSkillId)
                .collect(Collectors.toList());

        AdminUserStatsDto stats = buildCandidateStats(candidateId);
        List<AdminUsersActivityLogDto> logs = getActivityLogs(user.getUserId(), 5);

        return new AdminCandidateProfileDto(
                user.getUserId(),
                candidate.getFirstName() + " " + candidate.getLastName(),
                user.getEmail(),
                user.getAccountStatus(),
                candidate.getLocation(),
                candidate.getWorkMode(),
                candidate.getDateOfBirth(),
                stats,
                skills,
                logs
        );
    }

    // ================================================
    // 🔹 INTERVIEWER PROFILE
    // ================================================
    private AdminInterviewerProfileDto buildInterviewerProfile(AdminUser user) {
        AdminInterviewer interviewer = interviewerRepo.findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Interviewer profile not found"));

        UUID userId = user.getUserId();

        AdminInterviewerStatsDto stats = buildInterviewerStats(userId);
        List<AdminInterviewerAvailabilityDayDto> weeklyAvailability = buildWeeklyAvailability(userId);
        List<AdminUsersActivityLogDto> logs = getActivityLogs(userId, 5);

        return new AdminInterviewerProfileDto(
                user.getUserId(),
                interviewer.getInterviewerId(),  // String — display only
                user.getEmail(),
                user.getAccountStatus(),
                interviewer.getAbout(),
                interviewer.getPhotoUrl(),
                stats,
                weeklyAvailability,
                logs
        );
    }

    // ================================================
    // 🔹 COMPANY ADMIN PROFILE
    // ================================================
    private AdminCompanyAdminProfileDto buildCompanyAdminProfile(AdminUser user) {
        List<AdminUsersActivityLogDto> logs = getActivityLogs(user.getUserId(), 5);

        return new AdminCompanyAdminProfileDto(
                user.getUserId(),
                user.getEmail(),
                user.getAccountStatus(),
                logs
        );
    }

    // ================================================
    // 🔹 CANDIDATE STATS
    // ================================================
    private AdminUserStatsDto buildCandidateStats(UUID candidateId) {
        long applications = candidateStatsRepo.countByCandidateId(candidateId);
        long interviews   = candidateInterviewRequestRepo.countByCandidateId(candidateId);
        long offers       = candidateStatsRepo.countByCandidateIdAndStatus(candidateId, "accepted");
        return new AdminUserStatsDto(applications, interviews, offers);
    }

    // ================================================
    // 🔹 INTERVIEWER STATS — from interview_request_interviewers
    //    totalInterviews  = all rows for this interviewer
    //    pendingRequests  = responseStatus = 'pending'
    //    responseRate     = (accepted + rejected) / total * 100
    // ================================================
    private AdminInterviewerStatsDto buildInterviewerStats(UUID userId) {
        long total    = interviewerRequestRepo.countByInterviewerUserId(userId);
        long pending  = interviewerRequestRepo.countByInterviewerUserIdAndResponseStatus(userId, "pending");
        long responded = total - pending;  // accepted + rejected

        long responseRate = total > 0 ? (responded * 100) / total : 0;

        return new AdminInterviewerStatsDto(total, pending, responseRate);
    }

    // ================================================
    // 🔹 WEEKLY AVAILABILITY
    // ================================================
    private List<AdminInterviewerAvailabilityDayDto> buildWeeklyAvailability(UUID userId) {
        List<String> orderedDays = List.of(
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        );

        Map<String, Boolean> dbMap = availabilityRepo.findByInterviewerId(userId)
                .stream()
                .collect(Collectors.toMap(
                        d -> d.getDayName().trim(),
                        AdminInterviewerAvailabilityDay::getIsAvailable,
                        (existing, replacement) -> existing
                ));

        return orderedDays.stream()
                .map(day -> new AdminInterviewerAvailabilityDayDto(day, dbMap.getOrDefault(day, null)))
                .collect(Collectors.toList());
    }

    // ================================================
    // 🔹 ACTIVITY LOGS
    // ================================================
    private List<AdminUsersActivityLogDto> getActivityLogs(UUID userId, int limit) {
        return activityLogRepo.findByUserId(userId)
                .stream()
                .sorted(Comparator.comparing(ActivityLog::getCreatedAt).reversed())
                .limit(limit)
                .map(log -> new AdminUsersActivityLogDto(
                        log.getAction(),
                        log.getDescription(),
                        log.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // ================================================
    // 🔹 SUSPEND / RESTORE / FLAG
    // ================================================
    public void suspendUser(UUID userId) {
        AdminUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAccountStatus("suspended");
        userRepo.save(user);
        logAction(userId, user.getRole(), "UPDATE", "USER", "User account suspended");
    }

    public void restoreUser(UUID userId) {
        AdminUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAccountStatus("active");
        userRepo.save(user);
        logAction(userId, user.getRole(), "UPDATE", "USER", "User account restored");
    }

    public void flagUser(UUID userId) {
        AdminUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        logAction(userId, user.getRole(), "FLAG", "USER", "User account flagged");
    }

    // ================================================
    // 🔹 INTERNAL ACTIVITY LOGGER
    // ================================================
    private void logAction(UUID userId, String userRole, String action, String entityType, String description) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .userRole(userRole)
                .action(action)
                .entityType(entityType)
                .description(description)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        activityLogRepo.save(log);
    }
}