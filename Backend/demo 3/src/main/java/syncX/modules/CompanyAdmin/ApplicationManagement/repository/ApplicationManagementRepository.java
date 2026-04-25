package syncX.modules.CompanyAdmin.ApplicationManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import syncX.modules.candidatedashboard.entity.JobApplication;

import java.util.List;

@Repository
public interface ApplicationManagementRepository
        extends JpaRepository<JobApplication, Long> {

    /**
     * 🔹 Get all applications for a company (FIXED)
     */
    @Query(
            value = "SELECT * FROM job_applications WHERE \"Company_Id\" = CAST(:companyId AS uuid) ORDER BY applied_date DESC",
            nativeQuery = true
    )
    List<JobApplication> getApplicationsByCompanyId(@Param("companyId") String companyId);

    /**
     * 🔹 Count total applications
     */
    @Query(
            value = "SELECT COUNT(*) FROM job_applications WHERE \"Company_Id\" = CAST(:companyId AS uuid)",
            nativeQuery = true
    )
    long countTotalByCompany(@Param("companyId") String companyId);

    /**
     * 🔹 Count by status
     */
    @Query(
            value = "SELECT COUNT(*) FROM job_applications WHERE \"Company_Id\" = CAST(:companyId AS uuid) AND status = :status",
            nativeQuery = true
    )
    long countByCompanyAndStatus(
            @Param("companyId") String companyId,
            @Param("status") String status
    );
}