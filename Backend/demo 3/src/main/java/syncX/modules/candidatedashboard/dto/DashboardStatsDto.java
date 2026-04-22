package syncX.modules.candidatedashboard.dto;

import lombok.Data;

@Data
public class DashboardStatsDto {
    private long interviews;
    private long applications;
    private long pending;
    private long rejected;
}
