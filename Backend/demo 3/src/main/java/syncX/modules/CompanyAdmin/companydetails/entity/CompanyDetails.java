package syncX.modules.CompanyAdmin.companydetails.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "company_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetails {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "company_id", unique = true)
    private UUID companyId;

    private String website;

    @Column(length = 2000)
    private String about;

    private String logoUrl;
}