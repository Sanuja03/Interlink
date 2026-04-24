package syncX.modules.cjobpost.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.cjobpost.entity.Cjobpost;
import syncX.modules.cjobpost.service.CjobpostService;
import syncX.modules.enums.Category;
import syncX.modules.enums.ExperienceLevel;
import syncX.modules.enums.EmploymentType;

import java.util.List;
@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")

public class CjobpostController {

    @Autowired
    private CjobpostService service;

    // ✅ Single endpoint handles both ALL + FILTER
    @GetMapping
    public ResponseEntity<List<Cjobpost>> getJobs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String employmentType
    ) {
        Category cat = null;
        ExperienceLevel exp = null;
        EmploymentType emp = null;

        try {
            if (category != null) {
                cat = Category.valueOf(category.trim().toUpperCase());
            }
            if (experienceLevel != null) {
                exp = ExperienceLevel.valueOf(experienceLevel.trim().toUpperCase());
            }
            if (employmentType != null) {
                emp = EmploymentType.valueOf(employmentType.trim().toUpperCase());
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        if (cat == null && exp == null && emp == null) {
            return ResponseEntity.ok(service.getAllJobPosts());
        }

        return ResponseEntity.ok(service.filterJobs(cat, exp, emp));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cjobpost> getJobById(@PathVariable Long id) {
        Cjobpost job = service.getJobPostById(id);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(job);
    }

    @PostMapping
    public ResponseEntity<Cjobpost> createJob(@RequestBody Cjobpost job) {
        return ResponseEntity.ok(service.saveJobPost(job));
    }
}