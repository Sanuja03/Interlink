package syncX.modules.SuperAdmin.Admin_jobs.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import syncX.modules.SuperAdmin.Admin_companies.repository.AdminCompanyRepository;
import syncX.modules.SuperAdmin.Admin_jobs.dto.*;
import syncX.modules.SuperAdmin.Admin_jobs.entity.AdminJob;
import syncX.modules.SuperAdmin.Admin_jobs.repository.AdminJobRepository;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminJobService {

    private final AdminJobRepository JobRepo;
    private final AdminCompanyRepository companyRepo;

    // GET ALL JOBS
    public Page<AdminJobListDto> getJobs(
            String search,
            String status,
            String type,
            String category,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        search   = (search   == null) ? "" : search;
        status   = (status   == null) ? "" : status;
        type     = (type     == null) ? "" : type;
        category = (category == null) ? "" : category;

        return JobRepo.searchJobsWithCompany(search, status, type, category, pageable)
                .map(row -> new AdminJobListDto(
                        ((Number) row[0]).longValue(),  // id
                        (String)  row[1],               // title
                        (String)  row[2],               // location
                        (String)  row[3],               // employmentType
                        (String)  row[4],               // category
                        (String)  row[5],               // status
                        (String)  row[8]                // companyName
                ));
    }

    // GET JOB DETAILS (FIXED)
    public AdminJobDetailsDto getJobDetails(Long id) {

        List<Object[]> results = JobRepo.findJobWithCompany(id);

        if (results.isEmpty()) {
            throw new RuntimeException("Job not found: " + id);
        }

        Object[] row = results.get(0);

        long applications = JobRepo.countApplications(id);

        // companyId (UUID)
        UUID companyId = null;
        if (row[7] != null) {
            try {
                companyId = UUID.fromString(row[7].toString());
            } catch (Exception ignored) {}
        }

        // createdAt
        OffsetDateTime createdAt = null;
        if (row[6] instanceof OffsetDateTime odt) {
            createdAt = odt;
        } else if (row[6] instanceof java.sql.Timestamp ts) {
            createdAt = ts.toInstant().atOffset(ZoneOffset.UTC);
        }

        return new AdminJobDetailsDto(
                ((Number) row[0]).longValue(),  // id
                (String)  row[1],               // title
                (String)  row[2],               // location
                (String)  row[3],               // employmentType
                (String)  row[4],               // category
                (String)  row[5],               // status
                createdAt,
                companyId,
                (String)  row[8],               // companyName
                applications
        );
    }

    // FLAG JOB
    public void flagJob(Long id) {
        var job = JobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        job.setStatus("FLAGGED");
        JobRepo.save(job);
    }

    // UNFLAG JOB
    public void unflagJob(Long id) {
        var job = JobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        job.setStatus("OPEN");
        JobRepo.save(job);
    }

    // SUSPEND JOB
    public void suspendJob(Long id) {
        var job = JobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        job.setStatus("SUSPENDED");
        JobRepo.save(job);
    }

    // RESTORE JOB
    public void restoreJob(Long jobId) {
        AdminJob job = JobRepo.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Block restore if the owning company is still suspended
        companyRepo.findById(job.getCompanyId()).ifPresent(company -> {
            if ("suspended".equals(company.getCompanyActivityStatus())) {
                throw new RuntimeException(
                        "Cannot restore job while the company is suspended. Restore the company first."
                );
            }
        });

        job.setStatus("OPEN");
        JobRepo.save(job);
    }
}