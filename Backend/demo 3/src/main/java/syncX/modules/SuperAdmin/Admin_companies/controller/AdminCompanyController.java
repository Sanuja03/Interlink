package syncX.modules.SuperAdmin.Admin_companies.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import syncX.modules.SuperAdmin.Admin_companies.dto.*;
import syncX.modules.SuperAdmin.Admin_companies.service.AdminCompanyService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/companies")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminCompanyController {

    private final AdminCompanyService service;

    // TODO: Add auth check (SUPER_ADMIN role)

    @GetMapping("/pending")
    public List<AdminCompanyListDto> getPendingCompanies() {
        return service.getPendingCompanies();
    }

    @GetMapping("/approved")
    public List<AdminCompanyListDto> getApprovedCompanies() {
        return service.getApprovedCompanies();
    }

    @GetMapping("/{id}")
    public AdminCompanyDetailDto getCompany(@PathVariable UUID id) {
        return service.getCompanyById(id);
    }

    @PutMapping("/{id}/approve")
    public void approve(@PathVariable UUID id) {
        service.approveCompany(id);
    }

    @PutMapping("/{id}/reject")
    public void reject(@PathVariable UUID id) {
        service.rejectCompany(id);
    }

    @PutMapping("/{id}/suspend")
    public void suspend(@PathVariable UUID id) {
        service.suspendCompany(id);
    }

    @PutMapping("/{id}/flag")
    public void flag(@PathVariable UUID id) {
        service.flagCompany(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.deleteCompany(id);
    }
    @PutMapping("/{id}/restore")
    public void restore(@PathVariable UUID id) {
        service.restoreCompany(id);
    }

    @PutMapping("/{id}/unflag")
    public void unflag(@PathVariable UUID id) {
        service.unflagCompany(id);
    }

    @GetMapping("/search")
    public List<AdminCompanyListDto> searchCompanies(
            @RequestParam String search,
            @RequestParam String status
    ) {
        return service.searchCompanies(search, status);
    }

}