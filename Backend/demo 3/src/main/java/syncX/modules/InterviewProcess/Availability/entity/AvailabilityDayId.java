// composite key
package syncX.modules.InterviewProcess.Availability.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class AvailabilityDayId implements Serializable {

    @Column(name = "intavailability_id")
    private UUID weeklyAvailability;

    @Column(name = "available_date")
    private LocalDate availableDate;

    public AvailabilityDayId() {}

    public AvailabilityDayId(UUID weeklyAvailability, LocalDate availableDate) {
        this.weeklyAvailability = weeklyAvailability;
        this.availableDate = availableDate;
    }

    public UUID getWeeklyAvailability() { return weeklyAvailability; }
    public void setWeeklyAvailability(UUID weeklyAvailability) { this.weeklyAvailability = weeklyAvailability; }

    public LocalDate getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDate availableDate) { this.availableDate = availableDate; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AvailabilityDayId)) return false;
        AvailabilityDayId that = (AvailabilityDayId) o;
        return Objects.equals(weeklyAvailability, that.weeklyAvailability) &&
                Objects.equals(availableDate, that.availableDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(weeklyAvailability, availableDate);
    }
}