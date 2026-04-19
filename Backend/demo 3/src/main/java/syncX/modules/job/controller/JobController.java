package syncX.modules.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.job.dto.JobRequestDto;
import syncX.modules.job.service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody JobRequestDto dto) {
        try {
            return ResponseEntity.ok(jobService.createJob(dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}