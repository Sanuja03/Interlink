package syncX.modules.SuperAdmin.Admin_companies.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompany;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminCompanyRepository extends JpaRepository<AdminCompany, UUID> {

    // Fetch companies by exact status
    List<AdminCompany> findByCompanyStatus(String status);

    // Fetch companies excluding a specific status
    List<AdminCompany> findByCompanyStatusNot(String status);

    // Find company linked to a specific user
    Optional<AdminCompany> findByUserId(UUID userId);

    // Custom query to search companies by status and keyword across multiple fields
    @Query("""
        SELECT c FROM AdminCompany c
        WHERE 
            c.companyStatus = :status
            AND (
                LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.companyEmail) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.companyLocation) LIKE LOWER(CONCAT('%', :search, '%'))
            )
    """)
    List<AdminCompany> searchByStatus(
            @Param("search") String search, // Search keyword
            @Param("status") String status  // Filter by company status
    );
}