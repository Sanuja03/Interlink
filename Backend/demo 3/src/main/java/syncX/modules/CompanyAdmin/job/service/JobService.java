package syncX.modules.CompanyAdmin.job.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.job.entity.Job;
import syncX.modules.CompanyAdmin.job.repository.JobRepository;

import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    // 🔥 CREATE JOB (FIXED)
    public Job createJob(Job job) {

        // ✅ SET DEFAULT VALUES
        job.setStatus("Active");
        job.setCreatedDate(java.time.LocalDate.now().toString());

        return jobRepository.save(job);
    }

    // 🔥 GET ALL JOBS (for Job Management page)
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // 🔥 CLOSE / ACTIVATE JOB
    public Job toggleJobStatus(Long id) {
        Job job = jobRepository.findById(id).orElseThrow();

        if ("Active".equals(job.getStatus())) {
            job.setStatus("Closed");
        } else {
            job.setStatus("Active");
        }

        return jobRepository.save(job);
    }

    // 🔥 GET JOB BY ID (FOR EDIT PAGE)
    public Job getJobById(Long id) {
        return jobRepository.findById(id).orElseThrow();
    }

    // 🔥 UPDATE JOB (EDIT FEATURE)
    public Job updateJob(Long id, Job updatedJob) {
        Job job = jobRepository.findById(id).orElseThrow();

        job.setJobTitle(updatedJob.getJobTitle());
        job.setDepartment(updatedJob.getDepartment());
        job.setEmploymentType(updatedJob.getEmploymentType());
        job.setCategory(updatedJob.getCategory());
        job.setInterviewRounds(updatedJob.getInterviewRounds());
        job.setInterviewStages(updatedJob.getInterviewStages());
        job.setJobLocation(updatedJob.getJobLocation());
        job.setExperienceLevel(updatedJob.getExperienceLevel());
        job.setVacancies(updatedJob.getVacancies());
        job.setKeyRequirements(updatedJob.getKeyRequirements());

        return jobRepository.save(job);
    }

    // 🔥 DELETE JOB (NEW)
    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }
}