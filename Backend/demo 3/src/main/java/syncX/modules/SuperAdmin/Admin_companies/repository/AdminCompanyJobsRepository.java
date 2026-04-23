package syncX.modules.SuperAdmin.Admin_companies.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompanyJobs;

import java.util.List;
import java.util.UUID;


public interface AdminCompanyJobsRepository extends JpaRepository<AdminCompanyJobs, Long> {

    List<AdminCompanyJobs> findByCompanyId(UUID companyId);
}