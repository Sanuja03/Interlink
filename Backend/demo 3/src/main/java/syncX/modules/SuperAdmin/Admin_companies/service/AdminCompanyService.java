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

    private final AdminCompanyRepository AdminCompanyRepository;
    private final AdminCompanyJobsRepository AdminCompanyJobsRepository;
    private final AdminCompanyUsersRepository AdminCompanyUsersRepository;

    // Get full company details including jobs and logo
    public AdminCompanyDetailDto getCompanyById(UUID id) {
        AdminCompany company = AdminCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        List<AdminCompanyDetailJobsDto> jobs = null;

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

        // Fetch logo from company_details — null if not set
        String logoUrl = AdminCompanyRepository
                .findLogoUrlByCompanyId(company.getId())
                .orElse(null);

        return new AdminCompanyDetailDto(
                company.getId(),
                company.getCompanyName(),
                company.getCompanyEmail(),
                company.getIndustry(),
                company.getCompanySize(),
                company.getCompanyLocation(),
                company.getCompanyStatus(),
                company.getCompanyActivityStatus(),
                jobs,
                logoUrl
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
        c.setCompanyActivityStatus("suspended");
        AdminCompanyRepository.save(c);
        AdminCompanyUsersRepository.deactivateCompanyUsers(id);
        AdminCompanyJobsRepository.suspendJobsByCompanyId(id);
    }

    public void restoreCompany(UUID id) {
        AdminCompany c = getCompany(id);
        c.setCompanyActivityStatus("normal");
        AdminCompanyRepository.save(c);
        AdminCompanyUsersRepository.activateCompanyUsers(id);
        AdminCompanyJobsRepository.restoreJobsByCompanyId(id);
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
        c.setCompanyStatus("deleted");
        AdminCompanyRepository.save(c);
    }

    private AdminCompany getCompany(UUID id) {
        return AdminCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    // Fetch logo from company_details and include in list DTO
    private AdminCompanyListDto mapToListDTO(AdminCompany c) {
        String logoUrl = AdminCompanyRepository
                .findLogoUrlByCompanyId(c.getId())
                .orElse(null);

        return new AdminCompanyListDto(
                c.getId(),
                c.getCompanyName(),
                c.getCompanyEmail(),
                c.getIndustry(),
                c.getCompanyLocation(),
                c.getCompanySize(),
                c.getCompanyStatus(),
                c.getCompanyActivityStatus(),
                logoUrl
        );
    }

    public List<AdminCompanyListDto> searchCompanies(String search, String status) {
        return AdminCompanyRepository.searchByStatus(search, status)
                .stream()
                .map(this::mapToListDTO)
                .toList();
    }
}