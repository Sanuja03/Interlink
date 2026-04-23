package syncX.modules.CompanyAdmin.ApplicationManagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.ApplicationManagement.entity.ApplicationManagement;
import syncX.modules.CompanyAdmin.ApplicationManagement.repository.ApplicationManagementRepository;
import syncX.modules.CompanyAdmin.ApplicationManagement.service.ApplicationManagementService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationManagementServiceImpl implements ApplicationManagementService {

    private final ApplicationManagementRepository repository;

    @Override
    public ApplicationManagement save(ApplicationManagement application) {

        // ✅ Set default values
        application.setCreatedAt(LocalDateTime.now());
        application.setStatus("UNDER_REVIEW");

        return repository.save(application);
    }

    @Override
    public List<ApplicationManagement> getAll() {
        return repository.findAll();
    }

    @Override
    public ApplicationManagement updateStatus(UUID id, String action) {

        ApplicationManagement app = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        String currentStatus = app.getStatus();

        // 🔴 REJECT (can happen anytime)
        if ("REJECT".equalsIgnoreCase(action)) {
            app.setStatus("REJECTED");
        }

        // 🟢 PROGRESS FLOW
        else if ("PROGRESS".equalsIgnoreCase(action)) {

            switch (currentStatus) {

                case "UNDER_REVIEW":
                    app.setStatus("SHORTLISTED"); // first click
                    break;

                case "SHORTLISTED":
                    app.setStatus("INTERVIEW"); // second click
                    break;

                case "INTERVIEW":
                    // 🚫 already final stage → do nothing
                    return app;

                case "REJECTED":
                    // 🚫 cannot progress rejected
                    return app;

                default:
                    throw new RuntimeException("Invalid current status: " + currentStatus);
            }
        }

        else {
            throw new RuntimeException("Invalid action: " + action);
        }

        // ✅ update timestamp
        app.setUpdatedAt(LocalDateTime.now());

        return repository.save(app);
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}