package syncX.modules.CompanyAdmin.CompanyDetails.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name = "AdminCompanyDetails")
@Table(name = "company_details")
@Data
public class CompanyDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "company_id", unique = true)
    private UUID companyId;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_email")
    private String companyEmail;

    @Column(name = "industry")
    private String industry;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "company_location")
    private String companyLocation;

    @Column(name = "website")
    private String website;

    @Column(name = "about")
    private String about;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}