package syncX.modules.CompanyAdmin.ApplicationManagement.service;

import syncX.modules.CompanyAdmin.ApplicationManagement.entity.ApplicationManagement;

import java.util.List;
import java.util.UUID;

public interface ApplicationManagementService {

    ApplicationManagement save(ApplicationManagement application);

    List<ApplicationManagement> getAll();

    ApplicationManagement updateStatus(UUID id, String status);

    void delete(UUID id);
}