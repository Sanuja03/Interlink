package syncX.modules.CompanyAdmin.companydetails.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.companydetails.entity.CompanyDetails;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyDetailsRepository extends JpaRepository<CompanyDetails, UUID> {

    // 🔥 Find company details by company_id (UNIQUE)
    Optional<CompanyDetails> findByCompanyId(UUID companyId);

    // 🔥 Optional: check existence (useful for validation / signup logic)
    boolean existsByCompanyId(UUID companyId);

    // 🔥 Optional: delete (if needed later)
    void deleteByCompanyId(UUID companyId);
}