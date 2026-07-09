package syncX.modules.CompanyAdmin.ComapyDashBoard.DTO;

public class DashboardStatsDTO {
    private long totalJobPosts;
    private long totalApplications;
    private long shortlistedCandidates;
    private long upcomingInterviews;

    public long getTotalJobPosts() { return totalJobPosts; }
    public void setTotalJobPosts(long totalJobPosts) { this.totalJobPosts = totalJobPosts; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getShortlistedCandidates() { return shortlistedCandidates; }
    public void setShortlistedCandidates(long shortlistedCandidates) { this.shortlistedCandidates = shortlistedCandidates; }

    public long getUpcomingInterviews() { return upcomingInterviews; }
    public void setUpcomingInterviews(long upcomingInterviews) { this.upcomingInterviews = upcomingInterviews; }
}