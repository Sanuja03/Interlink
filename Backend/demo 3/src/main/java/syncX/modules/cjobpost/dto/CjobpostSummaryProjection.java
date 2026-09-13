package syncX.modules.cjobpost.dto;

import java.time.LocalDate;
import java.util.UUID;

public interface CjobpostSummaryProjection {
    Long getId();
    UUID getCompanyId();
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
