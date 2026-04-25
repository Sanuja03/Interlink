package syncX.modules.SuperAdmin.Admin_jobs.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import syncX.modules.SuperAdmin.Admin_jobs.dto.*;
import syncX.modules.SuperAdmin.Admin_jobs.service.AdminJobService;

@RestController
@RequestMapping("/api/admin/jobs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminJobController {

    private final AdminJobService service;

    @GetMapping
    public Page<AdminJobListDto> getJobs(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String type,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return service.getJobs(search, status, type, category, page, size);
    }

    @GetMapping("/{id}")
    public AdminJobDetailsDto getJob(@PathVariable Long id) {
        return service.getJobDetails(id);
    }

    @PutMapping("/{id}/flag")
    public void flag(@PathVariable Long id) {
        service.flagJob(id);
    }

    @PutMapping("/{id}/unflag")
    public void unflag(@PathVariable Long id) {
        service.unflagJob(id);
    }

    @PutMapping("/{id}/suspend")
    public void suspend(@PathVariable Long id) {
        service.suspendJob(id);
    }

    @PutMapping("/{id}/restore")
    public void restore(@PathVariable Long id) {
        service.restoreJob(id);
    }
}