package syncX.modules.SuperAdmin.Admin_companies.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminCompany {

    @Id
    @Column(name = "company_id")
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_email")
    private String companyEmail;

    private String industry;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "company_location")
    private String companyLocation;

    @Column(name = "company_status")
    private String companyStatus;

    @Column(name = "company_activity_status")
    private String companyActivityStatus;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}