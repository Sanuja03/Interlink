package syncX.modules.CompanyAdmin.job.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.job.entity.Job;
import syncX.modules.CompanyAdmin.job.repository.JobRepository;

import java.util.List;
import java.util.UUID;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    // ✅ CREATE JOB
    public Job createJob(Job job) {

        // 🔥 Ensure status is correct
        if (job.getStatus() == null || job.getStatus().isEmpty()) {
            job.setStatus("OPEN");
        }

        // createdAt handled by @PrePersist
        return jobRepository.save(job);
    }

    // ✅ GET ALL JOBS
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // ✅ GET JOBS BY COMPANY (FIXED 🔥)
    public List<Job> getJobsByCompany(UUID companyId) {
        return jobRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    // ✅ GET JOB BY ID
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    // ✅ TOGGLE STATUS (OPEN ↔ CLOSED)
    public Job toggleJobStatus(Long id) {

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if ("OPEN".equalsIgnoreCase(job.getStatus())) {
            job.setStatus("CLOSED");
        } else {
            job.setStatus("OPEN");
        }

        return jobRepository.save(job);
    }

    // ✅ UPDATE JOB (SAFE UPDATE)
    public Job updateJob(Long id, Job updatedJob) {

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (updatedJob.getJobTitle() != null)
            job.setJobTitle(updatedJob.getJobTitle());

        if (updatedJob.getDepartment() != null)
            job.setDepartment(updatedJob.getDepartment());

        if (updatedJob.getEmploymentType() != null)
            job.setEmploymentType(updatedJob.getEmploymentType());

        if (updatedJob.getCategory() != null)
            job.setCategory(updatedJob.getCategory());

        if (updatedJob.getInterviewRounds() != null)
            job.setInterviewRounds(updatedJob.getInterviewRounds());

        if (updatedJob.getInterviewStages() != null)
            job.setInterviewStages(updatedJob.getInterviewStages());

        if (updatedJob.getJobLocation() != null)
            job.setJobLocation(updatedJob.getJobLocation());

        if (updatedJob.getExperienceLevel() != null)
            job.setExperienceLevel(updatedJob.getExperienceLevel());

        if (updatedJob.getVacancies() != null)
            job.setVacancies(updatedJob.getVacancies());

        if (updatedJob.getKeyRequirements() != null)
            job.setKeyRequirements(updatedJob.getKeyRequirements());

        if (updatedJob.getStatus() != null)
            job.setStatus(updatedJob.getStatus());

        if (updatedJob.getCompanyId() != null)
            job.setCompanyId(updatedJob.getCompanyId());

        return jobRepository.save(job);
    }

    // ✅ DELETE JOB
    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }
}