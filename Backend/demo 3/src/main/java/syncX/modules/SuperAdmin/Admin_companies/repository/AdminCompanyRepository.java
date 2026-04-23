package syncX.modules.SuperAdmin.Admin_companies.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompany;
import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompanyJobs;

import java.util.List;
import java.util.UUID;

public interface AdminCompanyRepository extends JpaRepository<AdminCompany, UUID> {

    List<AdminCompany> findByCompanyStatus(String status);

    List<AdminCompany> findByCompanyStatusNot(String status);

    @Query("""
    SELECT c FROM AdminCompany c
    WHERE 
    (c.companyStatus = :status)
    AND (
    LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%'))
    OR LOWER(c.companyEmail) LIKE LOWER(CONCAT('%', :search, '%'))
    OR LOWER(c.companyLocation) LIKE LOWER(CONCAT('%', :search, '%'))
    )
    """)
        List<AdminCompany> searchByStatus(
                @Param("search") String search,
                @Param("status") String status
        );
}
