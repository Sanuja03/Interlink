package syncX.modules.SuperAdmin.Admin_users.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import syncX.modules.SuperAdmin.Admin_companies.repository.AdminCompanyRepository;
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

    // Repositories for user and related data
    private final AdminUserRepository userRepo;
    private final AdminCandidateRepository candidateRepo;
    private final AdminInterviewerRepository interviewerRepo;
    private final AdminCandidateSkillsRepository skillsRepo;
    private final AdminCandidateStatsRepository candidateStatsRepo;
    private final AdminCandidateInterviewRequestRepository candidateInterviewRequestRepo;
    private final AdminInterviewRequestInterviewerRepository interviewerRequestRepo;
    private final AdminInterviewerAvailabilityDayRepository availabilityRepo;
    private final ActivityLogRepository activityLogRepo;
    private final AdminCompanyRepository companyRepo;

    // Fetch all users with optional filters
    public List<AdminUsersListDto> getAllUsers(String search, String role) {
        List<AdminUser> users = userRepo.searchUsers(role, search);

        return users.stream().map(user -> {
            String name = resolveDisplayName(user); // Resolve display name based on role
            return new AdminUsersListDto(
                    user.getUserId(),
                    name,
                    user.getEmail(),
                    user.getRole(),
                    user.getAccountStatus()
            );
        }).collect(Collectors.toList());
    }

    // Determine display name depending on user role
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
            return user.getEmail(); // Fallback to email if anything fails
        }
    }

    // Get full profile based on user role
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

    // Build candidate profile with stats, skills, and logs
    private AdminCandidateProfileDto buildCandidateProfile(AdminUser user) {
        AdminCandidate candidate = candidateRepo.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        UUID candidateId = candidate.getCandidateId();

        List<String> skills = skillsRepo.findByCandidateId(candidateId)
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

    // Build interviewer profile with stats, availability, and logs
    private AdminInterviewerProfileDto buildInterviewerProfile(AdminUser user) {
        AdminInterviewer interviewer = interviewerRepo.findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Interviewer profile not found"));

        UUID userId = user.getUserId();

        AdminInterviewerStatsDto stats = buildInterviewerStats(userId);
        List<AdminInterviewerAvailabilityDayDto> weeklyAvailability = buildWeeklyAvailability(userId);
        List<AdminUsersActivityLogDto> logs = getActivityLogs(userId, 5);

        return new AdminInterviewerProfileDto(
                user.getUserId(),
                interviewer.getInterviewerId(),
                user.getEmail(),
                user.getAccountStatus(),
                interviewer.getAbout(),
                interviewer.getPhotoUrl(),
                stats,
                weeklyAvailability,
                logs
        );
    }

    // Build company admin profile with activity logs
    private AdminCompanyAdminProfileDto buildCompanyAdminProfile(AdminUser user) {
        List<AdminUsersActivityLogDto> logs = getActivityLogs(user.getUserId(), 5);

        return new AdminCompanyAdminProfileDto(
                user.getUserId(),
                user.getEmail(),
                user.getAccountStatus(),
                logs
        );
    }

    // Build candidate statistics with safe fallback
    private AdminUserStatsDto buildCandidateStats(UUID candidateId) {
        try {
            long applications = candidateStatsRepo.countByCandidateId(candidateId);
            long interviews   = candidateInterviewRequestRepo.countByCandidateId(candidateId);
            long offers       = candidateStatsRepo.countByCandidateIdAndStatus(candidateId, "ACCEPTED");
            return new AdminUserStatsDto(applications, interviews, offers);
        } catch (Exception e) {
            System.out.println("Stats load failed for candidateId " + candidateId + ": " + e.getMessage());
            return new AdminUserStatsDto(0L, 0L, 0L); // Return defaults if error occurs
        }
    }

    // Build interviewer statistics from request data
    private AdminInterviewerStatsDto buildInterviewerStats(UUID userId) {
        long total = interviewerRequestRepo.countByInterviewerUserId(userId);
        long pending = interviewerRequestRepo.countByInterviewerUserIdAndResponseStatus(userId, "pending");
        long responded = total - pending;

        long responseRate = total > 0 ? (responded * 100) / total : 0;

        return new AdminInterviewerStatsDto(total, pending, responseRate);
    }

    // Build weekly availability list for interviewer
    private List<AdminInterviewerAvailabilityDayDto> buildWeeklyAvailability(UUID userId) {
        List<String> orderedDays = List.of(
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        );

        Map<String, Boolean> dbMap = availabilityRepo.findByUserId(userId)
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

    // Fetch recent activity logs with limit
    private List<AdminUsersActivityLogDto> getActivityLogs(UUID userId, int limit) {
        try {
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
        } catch (Exception e) {
            System.out.println("Activity log fetch failed for userId " + userId + ": " + e.getMessage());
            return List.of(); // Return empty list if error occurs
        }
    }

    // Suspend a user account
    public void suspendUser(UUID userId) {
        AdminUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAccountStatus("suspended");
        userRepo.save(user);
    }

    // Check if a company is suspended
    private boolean isCompanySuspended(UUID companyId) {
        if (companyId == null) return false;
        return companyRepo.findById(companyId)
                .map(c -> "suspended".equals(c.getCompanyActivityStatus()))
                .orElse(false);
    }

    // Restore a user account with company hierarchy validation
    public void restoreUser(UUID userId) {
        AdminUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole().toLowerCase();

        if ("company_admin".equals(role)) {
            companyRepo.findByUserId(userId).ifPresent(company -> {
                if ("suspended".equals(company.getCompanyActivityStatus())) {
                    throw new RuntimeException(
                            "Cannot restore company admin while their company is suspended. Restore the company first."
                    );
                }
            });
        }

        if ("interviewer".equals(role)) {
            interviewerRepo.findById(userId).ifPresent(interviewer -> {
                if (isCompanySuspended(interviewer.getCompanyId())) {
                    throw new RuntimeException(
                            "Cannot restore interviewer while their company is suspended. Restore the company first."
                    );
                }
            });
        }

        user.setAccountStatus("active");
        userRepo.save(user);
    }

    // Flag a user account
    public void flagUser(UUID userId) {
        AdminUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAccountStatus("flagged");
        userRepo.save(user);
    }

    // Remove flag with hierarchy validation
    public void unflagUser(UUID userId) {
        AdminUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole().toLowerCase();

        if ("company_admin".equals(role)) {
            companyRepo.findByUserId(userId).ifPresent(company -> {
                if ("suspended".equals(company.getCompanyActivityStatus())) {
                    throw new RuntimeException(
                            "Cannot unflag company admin while their company is suspended."
                    );
                }
            });
        }

        if ("interviewer".equals(role)) {
            interviewerRepo.findById(userId).ifPresent(interviewer -> {
                if (isCompanySuspended(interviewer.getCompanyId())) {
                    throw new RuntimeException(
                            "Cannot unflag interviewer while their company is suspended."
                    );
                }
            });
        }

        user.setAccountStatus("active");
        userRepo.save(user);
    }
}