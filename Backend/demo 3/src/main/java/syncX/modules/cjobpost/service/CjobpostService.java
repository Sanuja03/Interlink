package syncX.modules.cjobpost.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import syncX.modules.cjobpost.dto.CjobpostResponseDTO;
import syncX.modules.cjobpost.dto.CjobpostSummaryProjection;
import syncX.modules.cjobpost.entity.Cjobpost;
import syncX.modules.cjobpost.repository.CjobpostRepository;
import syncX.modules.enums.Category;
import syncX.modules.enums.EmploymentType;
import syncX.modules.enums.ExperienceLevel;

import java.util.List;

@Service
public class CjobpostService {

    @Autowired
    private CjobpostRepository repository;

    @Transactional(readOnly = true)
    public List<CjobpostResponseDTO> getAllJobPosts() {
        return repository.findAllSummaries().stream()
                .map(this::toDto)
                .filter(j -> j.getCategory() != null && j.getEmploymentType() != null && j.getExperienceLevel() != null)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CjobpostResponseDTO> filterJobs(Category category,
                                                ExperienceLevel experienceLevel,
                                                EmploymentType employmentType) {
        return repository.findAllSummaries().stream()
                .map(this::toDto)
                .filter(j -> j.getCategory() != null && j.getEmploymentType() != null && j.getExperienceLevel() != null)
                .filter(j -> category == null || j.getCategory() == category)
                .filter(j -> experienceLevel == null || j.getExperienceLevel() == experienceLevel)
                .filter(j -> employmentType == null || j.getEmploymentType() == employmentType)
                .toList();
    }

    @Transactional(readOnly = true)
    public CjobpostResponseDTO getJobPostById(Long id) {
        return repository.findSummaryById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Transactional
    public Cjobpost saveJobPost(Cjobpost jobPost) {
        return repository.save(jobPost);
    }

    private CjobpostResponseDTO toDto(CjobpostSummaryProjection projection) {
        CjobpostResponseDTO dto = new CjobpostResponseDTO();
        dto.setId(projection.getId());
        dto.setCompany(projection.getCompany());
        dto.setLogo(projection.getLogo());
        dto.setLocation(projection.getLocation());
        dto.setEmploymentType(parseEmploymentType(projection.getEmploymentType()));
        dto.setCategory(parseCategory(projection.getCategory()));
        dto.setExperienceLevel(parseExperienceLevel(projection.getExperienceLevel()));
        dto.setTitle(projection.getTitle());
        dto.setAboutCompany(projection.getAboutCompany());
        dto.setDescription(projection.getDescription());
        dto.setDeadline(projection.getDeadline());
        return dto;
    }

    private EmploymentType parseEmploymentType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return EmploymentType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private Category parseCategory(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Category.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private ExperienceLevel parseExperienceLevel(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return ExperienceLevel.valueOf(value.trim().toUpperCase().replace(' ', '_'));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
