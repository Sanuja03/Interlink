package syncX.modules.SuperAdmin.Admin_companies.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminCompanyListDto {

    private UUID id;
    private String companyName;
    private String companyEmail;
    private String industry;
    private String companyLocation;
    private String companySize;
    private String companyStatus;
    private String companyActivity;
}