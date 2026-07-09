package syncX.modules.SuperAdmin.Admin_companies.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import syncX.modules.SuperAdmin.Admin_companies.dto.*;
import syncX.modules.SuperAdmin.Admin_companies.entity.AdminCompany;
import syncX.modules.SuperAdmin.Admin_companies.repository.AdminCompanyRepository;
import syncX.modules.SuperAdmin.Admin_companies.repository.AdminCompanyJobsRepository;
import syncX.modules.SuperAdmin.Admin_companies.repository.AdminCompanyUsersRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminCompanyService {

    // Repository for company data
    private final AdminCompanyRepository AdminCompanyRepository;

    // Repository for company jobs
    private final AdminCompanyJobsRepository AdminCompanyJobsRepository;

    // Repository for company users
    private final AdminCompanyUsersRepository AdminCompanyUsersRepository;

    // Get full company details including jobs (only if approved)
    public AdminCompanyDetailDto getCompanyById(UUID id) {

        // Fetch company or throw error if not found
        AdminCompany company = AdminCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        List<AdminCompanyDetailJobsDto> jobs = null;

        // Only include jobs if company is approved
        if ("approved".equalsIgnoreCase(company.getCompanyStatus())) {

            // Check if company is suspended
            boolean isSuspended = "suspended".equalsIgnoreCase(company.getCompanyActivityStatus());

            // Fetch and map jobs
            jobs = AdminCompanyJobsRepository.findByCompanyId(id)
                    .stream()
                    .map(job -> new AdminCompanyDetailJobsDto(
                            job.getTitle(),
                            job.getEmploymentType(),
                            isSuspended ? "CLOSED" : job.getStatus(), // Force CLOSED if suspended
                            job.getCreatedAt()
                    ))
                    .collect(Collectors.toList());
        }

        // Return company details DTO
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

    // Get all pending companies
    public List<AdminCompanyListDto> getPendingCompanies() {
        return AdminCompanyRepository.findByCompanyStatus("pending")
                .stream()
                .map(this::mapToListDTO)
                .collect(Collectors.toList());
    }

    // Get all approved companies
    public List<AdminCompanyListDto> getApprovedCompanies() {
        return AdminCompanyRepository.findByCompanyStatus("approved")
                .stream()
                .map(this::mapToListDTO)
                .collect(Collectors.toList());
    }

    // Approve a company
    public void approveCompany(UUID id) {
        AdminCompany c = getCompany(id);
        c.setCompanyStatus("approved");
        AdminCompanyRepository.save(c);
    }

    // Reject a company
    public void rejectCompany(UUID id) {
        AdminCompany c = getCompany(id);
        c.setCompanyStatus("rejected");
        AdminCompanyRepository.save(c);
    }

    // Suspend company, its users, and its jobs
    public void suspendCompany(UUID id) {
        AdminCompany c = getCompany(id);

        // Update company activity status
        c.setCompanyActivityStatus("suspended");
        AdminCompanyRepository.save(c);

        // Deactivate all related users
        AdminCompanyUsersRepository.deactivateCompanyUsers(id);

        // Suspend all jobs of the company
        AdminCompanyJobsRepository.suspendJobsByCompanyId(id);
    }

    // Restore company, its users, and its jobs
    public void restoreCompany(UUID id) {
        AdminCompany c = getCompany(id);

        // Reset company activity status
        c.setCompanyActivityStatus("normal");
        AdminCompanyRepository.save(c);

        // Reactivate all related users
        AdminCompanyUsersRepository.activateCompanyUsers(id);

        // Restore all jobs of the company
        AdminCompanyJobsRepository.restoreJobsByCompanyId(id);
    }

    // Flag a company unless it is suspended
    public void flagCompany(UUID id) {
        AdminCompany c = getCompany(id);

        // Prevent flagging if suspended
        if ("suspended".equalsIgnoreCase(c.getCompanyActivityStatus())) {
            throw new RuntimeException("Cannot flag a suspended company");
        }

        c.setCompanyActivityStatus("flagged");
        AdminCompanyRepository.save(c);
    }

    // Remove flag from a company unless it is suspended
    public void unflagCompany(UUID id) {
        AdminCompany c = getCompany(id);

        // Prevent unflagging if suspended
        if ("suspended".equalsIgnoreCase(c.getCompanyActivityStatus())) {
            throw new RuntimeException("Cannot unflag a suspended company");
        }

        c.setCompanyActivityStatus("normal");
        AdminCompanyRepository.save(c);
    }

    // Soft delete a company by marking status
    public void deleteCompany(UUID id) {
        AdminCompany c = getCompany(id);
        c.setCompanyStatus("deleted");
        AdminCompanyRepository.save(c);
    }

    // Helper method to fetch company or throw exception
    private AdminCompany getCompany(UUID id) {
        return AdminCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    // Map entity to list DTO
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

    // Search companies by keyword and status
    public List<AdminCompanyListDto> searchCompanies(String search, String status) {
        return AdminCompanyRepository.searchByStatus(search, status)
                .stream()
                .map(this::mapToListDTO)
                .toList();
    }
}