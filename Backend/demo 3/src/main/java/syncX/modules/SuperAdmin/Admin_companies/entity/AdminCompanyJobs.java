package syncX.modules.SuperAdmin.Admin_companies.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminCompanyJobs {

    @Id
    private Long id;

    @Column(name = "job_title")
    private String title;

    @Column(name = "employment_type")
    private String employmentType;

    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "company_id")
    private UUID companyId;
}