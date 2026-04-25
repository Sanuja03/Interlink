package syncX.modules.SuperAdmin.Admin_users.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "interviewer_availability_days")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminInterviewerAvailabilityDay {

    @Id
    @Column(name = "intavailability_id")
    private UUID intavailabilityId;

    @Column(name = "interviewer_id")
    private UUID interviewerId;

    @Column(name = "available_date")
    private LocalDate availableDate;

    @Column(name = "day_name")
    private String dayName;

    @Column(name = "is_available")
    private Boolean isAvailable;
}