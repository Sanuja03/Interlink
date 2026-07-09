package syncX.modules.SuperAdmin.Admin_companies.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import syncX.modules.SuperAdmin.Admin_companies.dto.AdminCompanyDetailDto;
import syncX.modules.SuperAdmin.Admin_companies.dto.AdminCompanyListDto;
import syncX.modules.SuperAdmin.Admin_companies.service.AdminCompanyService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/companies")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminCompanyController {

    // Service layer to handle company-related business logic
    private final AdminCompanyService service;

    // Get all companies with pending status
    @GetMapping("/pending")
    public List<AdminCompanyListDto> getPendingCompanies() {
        return service.getPendingCompanies();
    }

    // Get all approved companies
    @GetMapping("/approved")
    public List<AdminCompanyListDto> getApprovedCompanies() {
        return service.getApprovedCompanies();
    }

    // Get details of a specific company by ID
    @GetMapping("/{id}")
    public AdminCompanyDetailDto getCompany(@PathVariable UUID id) {
        return service.getCompanyById(id);
    }

    // Approve a company
    @PutMapping("/{id}/approve")
    public void approve(@PathVariable UUID id) {
        service.approveCompany(id);
    }

    // Reject a company
    @PutMapping("/{id}/reject")
    public void reject(@PathVariable UUID id) {
        service.rejectCompany(id);
    }

    // Suspend a company
    @PutMapping("/{id}/suspend")
    public void suspend(@PathVariable UUID id) {
        service.suspendCompany(id);
    }

    // Flag a company for issues
    @PutMapping("/{id}/flag")
    public void flag(@PathVariable UUID id) {
        service.flagCompany(id);
    }

    // Delete a company permanently
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.deleteCompany(id);
    }

    // Restore a previously deleted company
    @PutMapping("/{id}/restore")
    public void restore(@PathVariable UUID id) {
        service.restoreCompany(id);
    }

    // Remove flag from a company
    @PutMapping("/{id}/unflag")
    public void unflag(@PathVariable UUID id) {
        service.unflagCompany(id);
    }

    // Search companies by keyword and status
    @GetMapping("/search")
    public List<AdminCompanyListDto> searchCompanies(
            @RequestParam String search,  // Search keyword
            @RequestParam String status   // Filter by company status
    ) {
        return service.searchCompanies(search, status);
    }
}