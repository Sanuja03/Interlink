package syncX.modules.cjobpost.dto;

import java.time.LocalDate;

public interface CjobpostSummaryProjection {
    Long getId();
    String getCompany();
    String getLogo();
    String getLocation();
    String getEmploymentType();
    String getCategory();
    String getExperienceLevel();
    String getTitle();
    String getAboutCompany();
    String getDescription();
    LocalDate getDeadline();
}
