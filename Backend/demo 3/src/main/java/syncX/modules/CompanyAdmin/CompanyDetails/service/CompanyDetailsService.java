package syncX.modules.CompanyAdmin.CompanyDetails.service;

import syncX.modules.CompanyAdmin.CompanyDetails.dto.CompanyDetailsUpdateRequest;
import syncX.modules.CompanyAdmin.CompanyDetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.CompanyDetails.repository.CompanyDetailsRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyDetailsService {

    private final CompanyDetailsRepository companyDetailsRepository;

    // ================================
    // 🔹 GET COMPANY DETAILS
    // ================================
    public CompanyDetails getCompanyDetails(UUID companyId) {
        return companyDetailsRepository
                .findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException("Company details not found"));
    }

    // ================================
    // 🔹 UPDATE COMPANY DETAILS
    // ================================
    public CompanyDetails updateCompanyDetails(UUID companyId,
                                               CompanyDetailsUpdateRequest request,
                                               MultipartFile logoFile) {

        CompanyDetails details = companyDetailsRepository
                .findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException("Company details not found"));

        if (request.getCompanyName() != null)
            details.setCompanyName(request.getCompanyName());

        if (request.getIndustry() != null)
            details.setIndustry(request.getIndustry());

        if (request.getCompanySize() != null)
            details.setCompanySize(request.getCompanySize());

        if (request.getCompanyLocation() != null)
            details.setCompanyLocation(request.getCompanyLocation());

        if (request.getCompanyEmail() != null)
            details.setCompanyEmail(request.getCompanyEmail());

        if (request.getWebsite() != null)
            details.setWebsite(request.getWebsite());

        if (request.getAbout() != null)
            details.setAbout(request.getAbout());

        // 🔥 Handle logo inside update
        if (logoFile != null && !logoFile.isEmpty()) {
            String logoUrl = uploadLogo(logoFile);
            details.setLogoUrl(logoUrl);
        }

        details.setUpdatedAt(LocalDateTime.now());

        return companyDetailsRepository.save(details);
    }

    // ================================
    // 🔥 ADD THIS METHOD (FIX ERROR)
    // ================================
    public CompanyDetails updateLogo(UUID companyId, MultipartFile logoFile) {

        CompanyDetails details = companyDetailsRepository
                .findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException("Company details not found"));

        if (logoFile != null && !logoFile.isEmpty()) {
            String logoUrl = uploadLogo(logoFile);
            details.setLogoUrl(logoUrl);
        }

        details.setUpdatedAt(LocalDateTime.now());

        return companyDetailsRepository.save(details);
    }

    // ================================
    // 🔹 LOGO UPLOAD (TEMP MOCK)
    // ================================
    private String uploadLogo(MultipartFile file) {
        // TODO: Replace with Supabase / S3 / Cloudinary
        return "https://your-storage-url/" + file.getOriginalFilename();
    }
}