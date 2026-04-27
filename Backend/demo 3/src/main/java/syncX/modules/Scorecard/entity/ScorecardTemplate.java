package syncX.modules.Scorecard.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "scorecard_templates")
public class ScorecardTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "scorecard_template_id")
    private UUID scorecardTemplateId;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "is_finalized", nullable = false)
    private boolean isFinalized = false;

    @Column(name = "created_by_admin_id", nullable = false)
    private UUID createdByAdminId;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("displayOrder ASC")
    private List<ScorecardTemplateField> fields = new ArrayList<>();
}