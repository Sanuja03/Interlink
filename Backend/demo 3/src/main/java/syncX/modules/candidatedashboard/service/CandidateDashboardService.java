package syncX.modules.candidatedashboard.service;
import syncX.modules.enums.ApplicationStatus;
import syncX.modules.enums.InterviewStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.candidatedashboard.dto.DashboardResponseDto;
import syncX.modules.candidatedashboard.dto.DashboardStatsDto;
import syncX.modules.candidatedashboard.entity.CandidateInterview;
import syncX.modules.candidatedashboard.entity.JobApplication;
import syncX.modules.candidatedashboard.repository.CandidateInterviewRepository;
import syncX.modules.candidatedashboard.repository.JobApplicationRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class CandidateDashboardService {

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private CandidateInterviewRepository interviewRepository;

    public DashboardResponseDto getDashboardData(UUID candidateId) {
        DashboardResponseDto response = new DashboardResponseDto();

        // Fetch Applications and Interviews
        List<JobApplication> applications = applicationRepository.findByCandidateId(candidateId);
        List<CandidateInterview> interviews = interviewRepository.findByCandidateId(candidateId);

        // Compute Stats
        long totalApplications = applicationRepository.countByCandidateId(candidateId);
        long totalInterviews = interviewRepository.countByCandidateId(candidateId);
        long pending = applicationRepository.countByCandidateIdAndResult(candidateId, ApplicationStatus.PENDING);
        long rejected = applicationRepository.countByCandidateIdAndResult(candidateId, ApplicationStatus.REJECTED);

        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setApplications(totalApplications);
        stats.setInterviews(totalInterviews);
        stats.setPending(pending);
        stats.setRejected(rejected);

        response.setStats(stats);
        response.setApplications(applications);
        response.setInterviews(interviews);

        return response;
    }

    public void seedDummyData(UUID candidateId) {
        // Clear old data for simple testing
        List<JobApplication> existingApps = applicationRepository.findByCandidateId(candidateId);
        applicationRepository.deleteAll(existingApps);

        List<CandidateInterview> existingInts = interviewRepository.findByCandidateId(candidateId);
        interviewRepository.deleteAll(existingInts);

        // Insert Dummy Applications
        String[] companies = {"PixelCraft Studio", "Alpha tech", "Innosence tech", "PixelCraft Studio"};
        String[] titles = {"UI/UX Designer", "Software Engineer", "UI/UX Designer", "Project manager"};
        String[] statuses = {"Pending", "Rejected", "Pending", "Pending"};
        
        for (int i = 0; i < 4; i++) {
            JobApplication app = new JobApplication();
            app.setCandidateId(candidateId);
            app.setCompany(companies[i]);
            app.setJobTitle(titles[i]);
            app.setAppliedDate(LocalDate.of(2025, 6, 9));
            app.setShortlistedDate(LocalDate.of(2025, 6, 10));
            app.setInterviewDate(LocalDate.of(2025, 6, 11));
            app.setResult(ApplicationStatus.valueOf(statuses[i].toUpperCase()));
            applicationRepository.save(app);
        }

        // Insert Dummy Interviews
        String[] intCompanies = {"Horizon Global", "Inova", "Interlink"};
        String[] roles = {"Software Engineer", "Project Manager", "Software Engineer"};
        String[] dates = {"24 June 2025", "27 June 2025", "24 June 2025"};
        String[] times = {"10:00 AM – 11:00 AM", "09:00 AM – 09:30 AM", "10:00 AM – 11:00 AM"};
        String[] modes = {"Online Interview", "Online Interview", "Online Interview"};
        String[] intStatuses = {"Completed", "Scheduled", "Rescheduled"};

        for (int i = 0; i < 3; i++) {
            CandidateInterview interview = new CandidateInterview();
            interview.setCandidateId(candidateId);
            interview.setCompany(intCompanies[i]);
            interview.setRole(roles[i]);
            LocalDate[] date = {
                    LocalDate.of(2025, 6, 24),
                    LocalDate.of(2025, 6, 27),
                    LocalDate.of(2025, 6, 24)
            };

            LocalTime[] time = {
                    LocalTime.of(10, 0),
                    LocalTime.of(9, 0),
                    LocalTime.of(10, 0)
            };
            interview.setMode(modes[i]);
            interview.setStatus(InterviewStatus.valueOf(intStatuses[i].toUpperCase()));
            interviewRepository.save(interview);
        }
    }
}
