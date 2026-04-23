package syncX.modules.CompanyAdmin.companydetails.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.CompanyAdmin.companydetails.entity.CompanyDetails;

import java.util.Optional;
import java.util.UUID;

public interface CompanyDetailsRepository extends JpaRepository<CompanyDetails, UUID> {

    Optional<CompanyDetails> findByCompanyId(UUID companyId);
}