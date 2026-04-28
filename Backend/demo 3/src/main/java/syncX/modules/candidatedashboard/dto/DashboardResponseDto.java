package syncX.modules.candidatedashboard.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardResponseDto {
    private DashboardStatsDto summary;
    private List<UpcomingInterviewDto> upcomingInterviews;
    private List<ApplicationTrackerDto> applicationTracker;
}
