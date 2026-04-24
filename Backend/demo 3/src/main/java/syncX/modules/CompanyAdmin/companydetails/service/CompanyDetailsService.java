package syncX.modules.CompanyAdmin.companydetails.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.companydetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.companydetails.repository.CompanyDetailsRepository;

import java.util.UUID;

@Service
public class CompanyDetailsService {

    @Autowired
    private CompanyDetailsRepository repository;

    // 🔥 GET COMPANY DETAILS
    public CompanyDetails getDetails(UUID companyId) {
        return repository.findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException("Company details not found"));
    }

    // 🔥 UPDATE (OR CREATE FIRST TIME)
    public CompanyDetails updateDetails(UUID companyId, CompanyDetails data) {

        // 🔥 Find existing OR create new (first time edit case)
        CompanyDetails details = repository.findByCompanyId(companyId)
                .orElseGet(() -> {
                    CompanyDetails newDetails = new CompanyDetails();
                    newDetails.setCompanyId(companyId);
                    return newDetails;
                });

        // 🔥 BASIC COMPANY INFO (editable now from company_details table)

        if (data.getCompanyName() != null)
            details.setCompanyName(data.getCompanyName());

        if (data.getCompanyEmail() != null)
            details.setCompanyEmail(data.getCompanyEmail());

        if (data.getIndustry() != null)
            details.setIndustry(data.getIndustry());

        if (data.getCompanySize() != null)
            details.setCompanySize(data.getCompanySize());

        if (data.getCompanyLocation() != null)
            details.setCompanyLocation(data.getCompanyLocation());

        // 🔥 EXTRA PROFILE DETAILS

        if (data.getWebsite() != null)
            details.setWebsite(data.getWebsite());

        if (data.getAbout() != null)
            details.setAbout(data.getAbout());

        if (data.getLogoUrl() != null)
            details.setLogoUrl(data.getLogoUrl());

        // 🔥 Save updated data
        return repository.save(details);
    }
}