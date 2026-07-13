package syncX.modules.SuperAdmin.Admin_companies.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompanyJobs;

import java.util.List;
import java.util.UUID;

public interface AdminCompanyJobsRepository extends JpaRepository<AdminCompanyJobs, Long> {

    List<AdminCompanyJobs> findByCompanyId(UUID companyId);

    //  SUSPEND ALL JOBS OF COMPANY
    @Modifying
    @Transactional
    @Query(value = """
        UPDATE jobs 
        SET status = 'SUSPENDED' 
        WHERE company_id = :companyId
    """, nativeQuery = true)
    void suspendJobsByCompanyId(@Param("companyId") UUID companyId);

    //  RESTORE ALL JOBS OF COMPANY
    @Modifying
    @Transactional
    @Query(value = """
        UPDATE jobs 
        SET status = 'OPEN' 
        WHERE company_id = :companyId
    """, nativeQuery = true)
    void restoreJobsByCompanyId(@Param("companyId") UUID companyId);
}