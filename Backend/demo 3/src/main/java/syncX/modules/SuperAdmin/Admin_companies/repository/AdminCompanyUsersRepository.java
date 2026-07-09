package syncX.modules.SuperAdmin.Admin_companies.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompanyUsers;

import java.util.UUID;

public interface AdminCompanyUsersRepository extends JpaRepository<AdminCompanyUsers, UUID> {

    // Suspend all users linked to a company (both company and interviewer users)
    @Modifying // Indicates this query modifies data
    @Transactional // Ensures execution within a transaction
    @Query(value = """
        UPDATE users
        SET account_status = 'suspended'
        WHERE user_id IN (
            SELECT user_id FROM companies WHERE company_id = :companyId
            UNION
            SELECT user_id FROM interviewers WHERE company_id = :companyId
        )
    """, nativeQuery = true)
    void deactivateCompanyUsers(@Param("companyId") UUID companyId); // Company ID parameter

    // Activate all users linked to a company (both company and interviewer users)
    @Modifying // Indicates this query modifies data
    @Transactional // Ensures execution within a transaction
    @Query(value = """
        UPDATE users
        SET account_status = 'active'
        WHERE user_id IN (
            SELECT user_id FROM companies WHERE company_id = :companyId
            UNION
            SELECT user_id FROM interviewers WHERE company_id = :companyId
        )
    """, nativeQuery = true)
    void activateCompanyUsers(@Param("companyId") UUID companyId); // Company ID parameter
}