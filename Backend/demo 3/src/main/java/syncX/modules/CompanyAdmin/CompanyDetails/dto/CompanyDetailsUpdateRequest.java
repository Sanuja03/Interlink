package syncX.modules.CompanyAdmin.CompanyDetails.dto;

import lombok.Data;

@Data
public class CompanyDetailsUpdateRequest {
    private String companyName;
    private String industry;
    private String companySize;
    private String companyLocation;
    private String companyEmail;
    private String website;
    private String about;
    private String logoUrl;
}