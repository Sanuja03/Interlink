package syncX.modules.CompanyAdmin.ApplicationManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.ApplicationManagement;

import java.util.UUID;

public interface ApplicationManagementRepository extends JpaRepository<ApplicationManagement, UUID> {
}