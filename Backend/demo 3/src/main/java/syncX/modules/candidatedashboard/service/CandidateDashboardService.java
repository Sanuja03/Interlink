package syncX.modules.candidatedashboard.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import syncX.modules.calendar.repository.InterviewScheduledRepository;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.repository.CandidateProfileRepository;
import syncX.modules.candidatedashboard.dto.ApplicationTrackerDto;
import syncX.modules.candidatedashboard.dto.DashboardResponseDto;
import syncX.modules.candidatedashboard.dto.DashboardStatsDto;
import syncX.modules.candidatedashboard.repository.JobApplicationRepository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CandidateDashboardService {

    private final JobApplicationRepository applicationRepository;
    private final InterviewScheduledRepository interviewScheduledRepository;
    private final CandidateProfileRepository candidateProfileRepository;

    public CandidateDashboardService(
            JobApplicationRepository applicationRepository,
            InterviewScheduledRepository interviewScheduledRepository,
            CandidateProfileRepository candidateProfileRepository) {
        this.applicationRepository = applicationRepository;
        this.interviewScheduledRepository = interviewScheduledRepository;
        this.candidateProfileRepository = candidateProfileRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboardDataForCurrentCandidate() {
        UUID candidateId = resolveCurrentCandidateId();
        DashboardStatsDto summary = new DashboardStatsDto();
        summary.setApplications(applicationRepository.countByCandidateId(candidateId));
        summary.setInterviews(interviewScheduledRepository.countByCandidateId(candidateId));
        summary.setPending(applicationRepository.countByCandidateIdAndStatus(candidateId, "PENDING"));
        summary.setRejected(applicationRepository.countByCandidateIdAndStatus(candidateId, "REJECTED"));

        // Map raw native-query rows → typed DTOs
        List<Map<String, Object>> rawRows =
                applicationRepository.findApplicationTrackerByCandidateId(candidateId);

        List<ApplicationTrackerDto> tracker = rawRows.stream().map(row -> {
            ApplicationTrackerDto dto = new ApplicationTrackerDto();
            dto.setId(row.get("id") != null ? ((Number) row.get("id")).longValue() : null);
            dto.setJobTitle((String) row.get("jobtitle"));
            dto.setCompany((String) row.get("company"));
            dto.setAppliedDate(toLocalDate(row.get("applieddate")));
            dto.setShortlistedDate(toLocalDate(row.get("shortlisteddate")));
            dto.setInterviewDate(toLocalDate(row.get("interviewdate")));
            dto.setStatus(row.get("status") != null ? row.get("status").toString() : "PENDING");
            return dto;
        }).collect(Collectors.toList());

        DashboardResponseDto response = new DashboardResponseDto();
        response.setSummary(summary);
        response.setUpcomingInterviews(
                interviewScheduledRepository.findUpcomingInterviewsByCandidateId(candidateId, LocalDate.now()));
        response.setApplicationTracker(tracker);

        return response;
    }

    /** Safely converts java.sql.Date or LocalDate objects coming from native queries. */
    private LocalDate toLocalDate(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDate ld) return ld;
        if (value instanceof Date sqlDate) return sqlDate.toLocalDate();
        return null;
    }

    private UUID resolveCurrentCandidateId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String subject = jwt.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        UUID userId;
        try {
            userId = UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        if (candidate.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return candidate.getId();
    }
}
