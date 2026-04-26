package syncX.modules.CompanyAdmin.companydetails.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import syncX.modules.CompanyAdmin.companydetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.companydetails.repository.CompanyDetailsRepository;

import syncX.modules.CompanyAdmin.company.entity.Company;
import syncX.modules.CompanyAdmin.company.repository.CompanyRepository;

import java.util.UUID;

@Service
public class CompanyDetailsService {

    @Autowired
    private CompanyDetailsRepository detailsRepository;

    @Autowired
    private CompanyRepository companyRepository;

    // =========================================
    // 🔹 GET COMPANY DETAILS
    // =========================================
    public CompanyDetails getDetails(UUID companyId) {
        return detailsRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException("Company details not found"));
    }

    // =========================================
    // 🔹 UPDATE BOTH TABLES
    // =========================================
    @Transactional
    public CompanyDetails updateDetails(UUID companyId, CompanyDetails data) {

        // 🔥 1. GET COMPANY
        Company company = companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // 🔥 2. UPDATE companies TABLE
        updateCompany(company, data);
        companyRepository.save(company);

        // 🔥 3. UPDATE company_details TABLE
        CompanyDetails details = detailsRepository.findByCompanyId(companyId)
                .orElseGet(() -> {
                    CompanyDetails newDetails = new CompanyDetails();
                    newDetails.setCompanyId(companyId);
                    return newDetails;
                });

        updateDetailsEntity(details, data);

        return detailsRepository.save(details);
    }

    // =========================================
    // 🔹 DELETE BOTH TABLES 🔥🔥🔥
    // =========================================
    @Transactional
    public void deleteDetails(UUID companyId) {

        // 🔥 DELETE company_details FIRST (FK safety)
        if (detailsRepository.existsByCompanyId(companyId)) {
            detailsRepository.deleteByCompanyId(companyId);
        }

        // 🔥 DELETE companies TABLE
        Company company = companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        companyRepository.delete(company);
    }

    // =========================================
    // 🔹 PRIVATE: UPDATE companies TABLE
    // =========================================
    private void updateCompany(Company company, CompanyDetails data) {

        if (data.getCompanyName() != null)
            company.setCompanyName(data.getCompanyName());

        if (data.getCompanyEmail() != null)
            company.setCompanyEmail(data.getCompanyEmail());

        if (data.getIndustry() != null)
            company.setIndustry(data.getIndustry());

        if (data.getCompanySize() != null)
            company.setCompanySize(data.getCompanySize());

        if (data.getCompanyLocation() != null)
            company.setCompanyLocation(data.getCompanyLocation());
    }

    // =========================================
    // 🔹 PRIVATE: UPDATE company_details TABLE
    // =========================================
    private void updateDetailsEntity(CompanyDetails details, CompanyDetails data) {

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

        if (data.getWebsite() != null)
            details.setWebsite(data.getWebsite());

        if (data.getAbout() != null)
            details.setAbout(data.getAbout());

        if (data.getLogoUrl() != null)
            details.setLogoUrl(data.getLogoUrl());
    }
}