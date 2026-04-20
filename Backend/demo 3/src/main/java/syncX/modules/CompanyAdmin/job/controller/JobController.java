package syncX.modules.CompanyAdmin.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.job.entity.Job;
import syncX.modules.CompanyAdmin.job.service.JobService;

@RestController
@RequestMapping("/company/jobs")
@CrossOrigin("*")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping("/create")
    public Job createJob(@RequestBody Job job) {
        return jobService.createJob(job);
    }
}