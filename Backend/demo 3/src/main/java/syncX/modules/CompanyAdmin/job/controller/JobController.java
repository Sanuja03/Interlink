package syncX.modules.CompanyAdmin.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.job.entity.Job;
import syncX.modules.CompanyAdmin.job.service.JobService;

import java.util.List;

@RestController
@RequestMapping("/company/jobs")
@CrossOrigin("*")
public class JobController {

    @Autowired
    private JobService jobService;

    // ✅ CREATE JOB
    @PostMapping("/create")
    public Job createJob(@RequestBody Job job) {
        return jobService.createJob(job);
    }

    // 🔥 GET ALL JOBS (VERY IMPORTANT)
    @GetMapping
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    // 🔥 CLOSE / ACTIVATE JOB
    @PutMapping("/close/{id}")
    public Job toggleJob(@PathVariable Long id) {
        return jobService.toggleJobStatus(id);
    }

    // 🔥 GET JOB BY ID (FOR EDIT PAGE)
    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    // 🔥 UPDATE JOB (EDIT FEATURE)
    @PutMapping("/update/{id}")
    public Job updateJob(@PathVariable Long id, @RequestBody Job job) {
        return jobService.updateJob(id, job);
    }

    // 🔥 DELETE JOB (NEW)
    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
    }
}