package syncX.modules.CompanyAdmin.ApplicationManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // 🔹 Get all applications by company (Company_Id = UUID in DB)
    List<Application> findByCompanyId(UUID companyId);

}