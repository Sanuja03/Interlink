package syncX.modules.jobpostdetails.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "companies")
public class CompanyDetails {

    @Id
    @Column(name = "company_id")
    private UUID companyid;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_description", columnDefinition = "TEXT")
    private String companyDescription;
}
