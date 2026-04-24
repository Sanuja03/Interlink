package syncX.modules.jobpostdetails.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import syncX.modules.jobpostdetails.dto.JobPostDetailsDTO;
import syncX.modules.jobpostdetails.entity.CompanyDetails;
import syncX.modules.jobpostdetails.entity.JobDetails;
import syncX.modules.jobpostdetails.repository.JobDetailsRepository;

import java.util.Optional;

@Service
public class JobDetailsService {

    @Autowired
    private JobDetailsRepository repository;

    @Transactional(readOnly = true)
    public JobPostDetailsDTO getJobDetailsById(Long id) {
        Optional<JobDetails> optionalJob = repository.findById(id);
        if (optionalJob.isEmpty()) {
            return null;
        }

        JobDetails job = optionalJob.get();
        JobPostDetailsDTO dto = new JobPostDetailsDTO();
        
        dto.setId(job.getId());
        dto.setCompany(job.getCompany());
        dto.setLogo(job.getLogo());
        dto.setLocation(job.getLocation());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setCategory(job.getCategory());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setTitle(job.getTitle());
        dto.setExperienceRequired(job.getExperienceRequired());

        dto.setJobBenefits(job.getJobBenefits());
        dto.setDescription(job.getDescription());

        CompanyDetails companyDetails = job.getCompanyDetails();
        if (companyDetails != null) {
            dto.setCompanyId(companyDetails.getCompanyid());
            dto.setCompanyName(companyDetails.getCompanyName());
            dto.setCompanyDescription(companyDetails.getCompanyDescription());
        }

        return dto;
    }
}
