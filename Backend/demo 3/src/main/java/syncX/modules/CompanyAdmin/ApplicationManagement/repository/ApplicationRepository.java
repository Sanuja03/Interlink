package syncX.modules.CompanyAdmin.ApplicationManagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.Application;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @Query(value = "SELECT * FROM job_applications WHERE \"Company_Id\" = :companyId", nativeQuery = true)
    List<Application> findByCompanyId(@Param("companyId") UUID companyId);

    @Query(value = "SELECT * FROM job_applications WHERE id = :id", nativeQuery = true)
    Optional<Application> findById(@Param("id") Long id);
}