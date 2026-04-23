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

    // 🔥 GET DETAILS
    public CompanyDetails getDetails(UUID companyId) {
        return repository.findByCompanyId(companyId)
                .orElse(new CompanyDetails());
    }

    // 🔥 UPDATE (OR CREATE FIRST TIME)
    public CompanyDetails updateDetails(UUID companyId, CompanyDetails data) {

        CompanyDetails details = repository.findByCompanyId(companyId)
                .orElseGet(() -> {
                    CompanyDetails newDetails = new CompanyDetails();
                    newDetails.setCompanyId(companyId);
                    return newDetails;
                });

        if (data.getWebsite() != null)
            details.setWebsite(data.getWebsite());

        if (data.getAbout() != null)
            details.setAbout(data.getAbout());

        if (data.getLogoUrl() != null)
            details.setLogoUrl(data.getLogoUrl());

        return repository.save(details);
    }
}