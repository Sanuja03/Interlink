package syncX.modules.SuperAdmin.Admin_jobs.entity;

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
@Builder
public class AdminJob {

    @Id
    private Long id;

    @Column(name = "job_title")
    private String title;

    @Column(name = "job_location")
    private String location;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "category")
    private String category;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "company_id")
    private UUID companyId;
}