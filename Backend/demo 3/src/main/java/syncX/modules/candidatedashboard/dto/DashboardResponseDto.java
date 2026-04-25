package syncX.modules.candidatedashboard.dto;

import lombok.Data;
import syncX.modules.candidatedashboard.entity.CandidateInterview;
import syncX.modules.candidatedashboard.entity.JobApplication;

import java.util.List;

@Data
public class DashboardResponseDto {
    private DashboardStatsDto stats;
    private List<CandidateInterview> interviews;
    private List<JobApplication> applications;
}
