package syncX.modules.InterviewProcess.Availability.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "interviewer_weekly_availability",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "week_key"}))
public class WeeklyAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "intavailability_id")
    private UUID availabilityId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "week_key", nullable = false, length = 10)
    private String weekKey;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(nullable = false, length = 20)
    private String status = "pending";

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "weeklyAvailability", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvailabilityDay> days = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }


}