package syncX.modules.CompanyAdmin.profileview.dto;

import java.util.Date;

public class ExperienceDTO {

    private String jobTitle;
    private String company;
    private Date startDate;
    private Date endDate;

    // ✅ GETTERS
    public String getJobTitle() {
        return jobTitle;
    }

    public String getCompany() {
        return company;
    }

    public Date getStartDate() {
        return startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    // ✅ SETTERS
    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
}