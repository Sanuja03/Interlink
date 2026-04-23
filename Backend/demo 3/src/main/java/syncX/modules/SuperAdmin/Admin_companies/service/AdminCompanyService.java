package syncX.modules.SuperAdmin.Admin_companies.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import syncX.modules.SuperAdmin.Admin_companies.dto.*;
import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompany;
import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompanyJobs;
import syncX.modules.SuperAdmin.Admin_companies.repository.AdminCompanyRepository;
import syncX.modules.SuperAdmin.Admin_companies.repository.AdminCompanyJobsRepository;
import syncX.modules.SuperAdmin.Admin_companies.repository.AdminCompanyUsersRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminCompanyService {

    private final AdminCompanyRepository AdminCompanyRepository;
    private final AdminCompanyJobsRepository AdminCompanyJobsRepository;
    private final AdminCompanyUsersRepository AdminCompanyUsersRepository;

    public AdminCompanyDetailDto getCompanyById(UUID id) {

        AdminCompany company = AdminCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        List<AdminCompanyDetailJobsDto> jobs = null;

        //  KEY LOGIC: Only approved companies get jobs
        if ("approved".equalsIgnoreCase(company.getCompanyStatus())) {

            boolean isSuspended = "suspended".equalsIgnoreCase(company.getCompanyActivityStatus());

            jobs = AdminCompanyJobsRepository.findByCompanyId(id)
                    .stream()
                    .map(job -> new AdminCompanyDetailJobsDto(
                            job.getTitle(),
                            job.getEmploymentType(),
                            isSuspended ? "CLOSED" : job.getStatus(),
                            job.getCreatedAt()
                    ))
                    .collect(Collectors.toList());
        }

        return new AdminCompanyDetailDto(
                company.getId(),
                company.getCompanyName(),
                company.getCompanyEmail(),
                company.getIndustry(),
                company.getCompanySize(),
                company.getCompanyLocation(),
                company.getCompanyStatus(),
                company.getCompanyActivityStatus(),
                jobs
        );
    }

    public List<AdminCompanyListDto> getPendingCompanies() {
        return AdminCompanyRepository.findByCompanyStatus("pending")
                .stream()
                .map(this::mapToListDTO)
                .collect(Collectors.toList());
    }

    public List<AdminCompanyListDto> getApprovedCompanies() {
        return AdminCompanyRepository.findByCompanyStatus("approved")
                .stream()
                .map(this::mapToListDTO)
                .collect(Collectors.toList());
    }

    public void approveCompany(UUID id) {
        AdminCompany c = getCompany(id);
        c.setCompanyStatus("approved");
        AdminCompanyRepository.save(c);
    }

    public void rejectCompany(UUID id) {
        AdminCompany c = getCompany(id);
        c.setCompanyStatus("rejected");
        AdminCompanyRepository.save(c);
    }

    public void suspendCompany(UUID id) {
        AdminCompany c = getCompany(id);

        // UI
        c.setCompanyActivityStatus("suspended");
        AdminCompanyRepository.save(c);

        // REAL LOGIC
        AdminCompanyUsersRepository.deactivateCompanyUsers(id);
    }

    public void restoreCompany(UUID id) {
        AdminCompany c = getCompany(id);

        // UI (optional)
        c.setCompanyActivityStatus("normal");
        AdminCompanyRepository.save(c);

        // REAL LOGIC
        AdminCompanyUsersRepository.activateCompanyUsers(id);
    }

    public void flagCompany(UUID id) {
        AdminCompany c = getCompany(id);
        if ("suspended".equalsIgnoreCase(c.getCompanyActivityStatus())) {
            throw new RuntimeException("Cannot flag a suspended company");
        }
        c.setCompanyActivityStatus("flagged");
        AdminCompanyRepository.save(c);
    }

    public void unflagCompany(UUID id) {
        AdminCompany c = getCompany(id);
        if ("suspended".equalsIgnoreCase(c.getCompanyActivityStatus())) {
            throw new RuntimeException("Cannot unflag a suspended company");
        }
        c.setCompanyActivityStatus("normal");
        AdminCompanyRepository.save(c);
    }

    public void deleteCompany(UUID id) {
        AdminCompany c = getCompany(id);
        c.setCompanyStatus("deleted"); // soft delete
        AdminCompanyRepository.save(c);
    }

    private AdminCompany getCompany(UUID id) {
        return AdminCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    private AdminCompanyListDto mapToListDTO(AdminCompany c) {
        return new AdminCompanyListDto(
                c.getId(),
                c.getCompanyName(),
                c.getCompanyEmail(),
                c.getIndustry(),
                c.getCompanyLocation(),
                c.getCompanySize(),
                c.getCompanyStatus(),
                c.getCompanyActivityStatus()
        );
    }

    public List<AdminCompanyListDto> searchCompanies(String search, String status) {
        return AdminCompanyRepository.searchByStatus(search, status)
                .stream()
                .map(this::mapToListDTO)
                .toList();
    }
}