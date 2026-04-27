package syncX.modules.CompanyAdmin.Shortlisting.dto;

import java.util.List;

public class ShortlistedByJobDTO {
    private Long jobId;
    private String jobTitle;
    private int shortlistedCount;
    private List<ShortlistResponseDTO> candidates;

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public int getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(int shortlistedCount) { this.shortlistedCount = shortlistedCount; }

    public List<ShortlistResponseDTO> getCandidates() { return candidates; }
    public void setCandidates(List<ShortlistResponseDTO> candidates) { this.candidates = candidates; }
}