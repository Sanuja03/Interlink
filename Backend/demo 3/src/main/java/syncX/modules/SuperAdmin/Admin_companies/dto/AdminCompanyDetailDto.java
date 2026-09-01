package syncX.modules.SuperAdmin.Admin_companies.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminCompanyDetailDto {

    private UUID id;
    private String companyName;
    private String companyEmail;
    private String industry;
    private String companySize;
    private String companyLocation;

    private String companyStatus;
    private String companyActivityStatus;

    private List<AdminCompanyDetailJobsDto> jobs; // ONLY for approved
    private String logoUrl;
}