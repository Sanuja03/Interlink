package syncX.modules.CompanyAdmin.CompanyDetails.repository;

import syncX.modules.CompanyAdmin.CompanyDetails.entity.CompanyDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository("adminCompanyDetailsRepository")
public interface CompanyDetailsRepository extends JpaRepository<CompanyDetails, UUID> {
    Optional<CompanyDetails> findByCompanyId(UUID companyId);
}