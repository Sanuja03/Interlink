// ID helper class used because your AvailabilityDay entity has two primary keys (separate class to represent that combined ID
package syncX.modules.InterviewProcess.Availability.entity;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

public class AvailabilityDayId implements Serializable {

    private UUID weeklyAvailability;
    private LocalDate availableDate;



    public AvailabilityDayId(UUID weeklyAvailability, LocalDate availableDate) {
        this.weeklyAvailability = weeklyAvailability;
        this.availableDate = availableDate;
    }

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