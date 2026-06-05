package syncX.modules.CompanyAdmin.CandidateHistory.dto;

public class HistoryStageDTO {

    private String stage;       // "Applied", "Shortlisted", etc.
    private String status;      // "Completed" or "Not Completed"
    private String date;        // "17.07.2025" or null

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}