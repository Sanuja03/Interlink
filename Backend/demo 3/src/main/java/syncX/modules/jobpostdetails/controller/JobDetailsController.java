package syncX.modules.jobpostdetails.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import syncX.modules.jobpostdetails.dto.JobPostDetailsDTO;
import syncX.modules.jobpostdetails.service.JobDetailsService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/jobpostdetails")
public class JobDetailsController {

    @Autowired
    private JobDetailsService service;

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobDetails(@PathVariable Long id) {
        try {
            JobPostDetailsDTO jobDetails = service.getJobDetailsById(id);
            if (jobDetails != null) {
                return ResponseEntity.ok(jobDetails);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            Throwable cause = e.getCause();
            while (cause != null) {
                errorMsg += " | Cause: " + cause.getMessage();
                cause = cause.getCause();
            }
            return ResponseEntity.internalServerError().body(errorMsg);
        }
    }
}
