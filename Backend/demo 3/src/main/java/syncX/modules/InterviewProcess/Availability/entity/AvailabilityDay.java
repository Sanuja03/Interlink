// AvailabilityDay.java
package syncX.modules.InterviewProcess.Availability.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "interviewer_availability_days")
public class AvailabilityDay {

    @EmbeddedId
    private AvailabilityDayId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("weeklyAvailability")
    @JoinColumn(name = "intavailability_id", nullable = false)
    private WeeklyAvailability weeklyAvailability;

    @Column(name = "day_name", nullable = false, length = 10)
    private String dayName;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;

    // Convenience getters that unwrap the embedded ID
    public LocalDate getAvailableDate() {
        return id != null ? id.getAvailableDate() : null;
    }

    // Convenience setter — ensures id is never null before setting
    public void setAvailableDate(LocalDate availableDate) {
        if (this.id == null) this.id = new AvailabilityDayId();
        this.id.setAvailableDate(availableDate);
    }
}