package syncX.modules.CompanyAdmin.CompanyDetails.repository;

import syncX.modules.auth.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository("companyDetailsModuleCompanyRepository")
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findByUserId(UUID userId);
    Optional<Company> findByCompanyId(UUID companyId);
}