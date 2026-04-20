package syncX.modules.candidatedashboard.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.candidatedashboard.dto.DashboardResponseDto;
import syncX.modules.candidatedashboard.dto.DashboardStatsDto;
import syncX.modules.candidatedashboard.entity.CandidateInterview;
import syncX.modules.candidatedashboard.entity.JobApplication;
import syncX.modules.candidatedashboard.repository.CandidateInterviewRepository;
import syncX.modules.candidatedashboard.repository.JobApplicationRepository;

import java.util.List;

@Service
public class CandidateDashboardService {

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private CandidateInterviewRepository interviewRepository;

    public DashboardResponseDto getDashboardData(Long candidateId) {
        DashboardResponseDto response = new DashboardResponseDto();

        // Fetch Applications and Interviews
        List<JobApplication> applications = applicationRepository.findByCandidateId(candidateId);
        List<CandidateInterview> interviews = interviewRepository.findByCandidateId(candidateId);

        // Compute Stats
        long totalApplications = applicationRepository.countByCandidateId(candidateId);
        long totalInterviews = interviewRepository.countByCandidateId(candidateId);
        long pending = applicationRepository.countByCandidateIdAndResultIgnoreCase(candidateId, "Pending");
        long rejected = applicationRepository.countByCandidateIdAndResultIgnoreCase(candidateId, "Rejected");

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

    public void seedDummyData(Long candidateId) {
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
            app.setAppliedDate("09.06.2025");
            app.setShortlistedDate("17.07.2025");
            app.setInterviewDate("17.12.2025");
            app.setResult(statuses[i]);
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
            interview.setDate(dates[i]);
            interview.setTime(times[i]);
            interview.setMode(modes[i]);
            interview.setStatus(intStatuses[i]);
            interviewRepository.save(interview);
        }
    }
}
