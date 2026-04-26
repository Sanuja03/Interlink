package syncX.modules.CompanyAdmin.company.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.CompanyAdmin.company.entity.Company;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    // =========================================
    // 🔹 FIND BY company_id (MAIN LOOKUP)
    // =========================================
    Optional<Company> findByCompanyId(UUID companyId);

    // =========================================
    // 🔹 CHECK EXISTENCE
    // =========================================
    boolean existsByCompanyId(UUID companyId);

    // =========================================
    // 🔹 DELETE BY company_id (IMPORTANT 🔥)
    // =========================================
    @Transactional
    void deleteByCompanyId(UUID companyId);

    // =========================================
    // 🔹 FIND BY EMAIL (optional but useful)
    // =========================================
    Optional<Company> findByCompanyEmail(String companyEmail);
}