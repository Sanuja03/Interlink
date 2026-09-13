package syncX.modules.jobpostdetails.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import syncX.modules.CompanyAdmin.CompanyDetails.repository.CompanyDetailsRepository;
import syncX.modules.jobpostdetails.dto.JobPostDetailsDTO;
import syncX.modules.jobpostdetails.entity.CompanyDetails;
import syncX.modules.jobpostdetails.entity.JobDetails;
import syncX.modules.jobpostdetails.repository.JobDetailsRepository;

import java.util.Optional;
import java.util.UUID;

@Service
public class JobDetailsService {

    @Autowired
    private JobDetailsRepository repository;

    @Autowired
    @Qualifier("adminCompanyDetailsRepository")
    private CompanyDetailsRepository companyDetailsRepository;

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

        UUID companyId = job.getCompanyId() != null ? job.getCompanyId()
                : (companyDetails != null ? companyDetails.getCompanyid() : null);

        if (companyId != null) {
            dto.setCompanyId(companyId);
            companyDetailsRepository.findByCompanyId(companyId).ifPresent(cd -> {
                if (cd.getLogoUrl() != null && !cd.getLogoUrl().isBlank()) {
                    dto.setLogo(cd.getLogoUrl());
                }
                if (cd.getCompanyName() != null && !cd.getCompanyName().isBlank()) {
                    dto.setCompanyName(cd.getCompanyName());
                    dto.setCompany(cd.getCompanyName());
                }
                if (cd.getAbout() != null && !cd.getAbout().isBlank()) {
                    dto.setCompanyDescription(cd.getAbout());
                }
            });
        }

        return dto;
    }
}
