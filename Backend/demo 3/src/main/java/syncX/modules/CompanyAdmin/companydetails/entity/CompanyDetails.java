package syncX.modules.CompanyAdmin.companydetails.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "company_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetails {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "company_id", unique = true, nullable = false)
    private UUID companyId;

    // 🔥 BASIC COMPANY INFO (copied from companies table at signup)

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_email")
    private String companyEmail;

    private String industry;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "company_location")
    private String companyLocation;

    // 🔥 EXTRA DETAILS (editable in settings UI)

    private String website;

    @Column(length = 2000)
    private String about;

    @Column(name = "logo_url")
    private String logoUrl;

    // 🔥 OPTIONAL: timestamps (good practice)

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    // 🔥 AUTO SET TIMESTAMPS

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}