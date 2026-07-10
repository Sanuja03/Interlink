package syncX.modules.Scorecard.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "scorecard_template_fields")
public class ScorecardTemplateField {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "scorecard_field_id")
    private UUID scorecardFieldId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scorecard_template_id", nullable = false)
    private ScorecardTemplate template;

    @Column(name = "field_label", nullable = false)
    private String fieldLabel;

    @Column(name = "max_score", nullable = false)
    private short maxScore = 10;

    @Column(name = "display_order", nullable = false)
    private short displayOrder = 0;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime createdAt;
}