package syncX.modules.auth.dto;
import lombok.Data;

@Data
public class CompanySignupDTO {
    private String companyName;
    private String companySize;
    private String industry;
    private String email;

}
