package syncX.modules.cjobpost.service;
import syncX.modules.enums.Category;
import syncX.modules.enums.ExperienceLevel;
import syncX.modules.enums.EmploymentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import syncX.modules.cjobpost.entity.Cjobpost;
import syncX.modules.cjobpost.repository.CjobpostRepository;

import java.util.List;

@Service
public class CjobpostService {

    @Autowired
    private CjobpostRepository repository;

    @Transactional(readOnly = true)
    public List<Cjobpost> getAllJobPosts() {
        return repository.findAll().stream()
                // Skip rows with invalid/unknown enum values entered by mistake
                .filter(j -> j.getCategory() != null && j.getEmploymentType() != null && j.getExperienceLevel() != null)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Cjobpost> filterJobs(Category category,
                                     ExperienceLevel experienceLevel,
                                     EmploymentType employmentType) {

        List<Cjobpost> jobs = repository.findAll();

        return jobs.stream()
                // Skip rows with invalid/unknown enum values entered by mistake
                .filter(j -> j.getCategory() != null && j.getEmploymentType() != null && j.getExperienceLevel() != null)
                .filter(j -> category == null || j.getCategory() == category)
                .filter(j -> experienceLevel == null || j.getExperienceLevel() == experienceLevel)
                .filter(j -> employmentType == null || j.getEmploymentType() == employmentType)
                .toList();
    }

    @Transactional(readOnly = true)
    public Cjobpost getJobPostById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public Cjobpost saveJobPost(Cjobpost jobPost) {
        return repository.save(jobPost);
    }
}