package syncX.modules.InterviewProcess.Availability.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@IdClass(AvailabilityDayId.class)
@Table(name = "interviewer_availability_days")
public class AvailabilityDay {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intavailability_id", nullable = false)
    private WeeklyAvailability weeklyAvailability;

    @Id
    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(name = "day_name", nullable = false, length = 10)
    private String dayName;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;


}