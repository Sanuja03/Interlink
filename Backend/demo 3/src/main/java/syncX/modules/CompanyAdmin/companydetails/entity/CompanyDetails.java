package syncX.modules.CompanyAdmin.companydetails.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDetails {

    // =========================================
    // 🔹 PRIMARY KEY
    // =========================================
    @Id
    @GeneratedValue
    private UUID id;

    // =========================================
    // 🔹 FOREIGN KEY → companies.company_id
    // =========================================
    @Column(name = "company_id", nullable = false, unique = true, updatable = false)
    private UUID companyId;

    // =========================================
    // 🔹 BASIC INFO (SYNC WITH companies)
    // =========================================
    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_email")
    private String companyEmail;

    private String industry;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "company_location")
    private String companyLocation;

    // =========================================
    // 🔹 EXTRA PROFILE DATA
    // =========================================
    private String website;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Column(name = "logo_url")
    private String logoUrl;

    // =========================================
    // 🔹 TIMESTAMPS
    // =========================================
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =========================================
    // 🔹 AUTO TIMESTAMPS
    // =========================================
    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID(); // 🔥 ensure UUID generation
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}