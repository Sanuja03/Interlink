package syncX.modules.SuperAdmin.Admin_companies.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminCompanyDetailJobsDto {

    private String title;
    private String employmentType;
    private String status;
    private OffsetDateTime createdAt;
}