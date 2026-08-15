package syncX.modules.CompanyAdmin.CompanyDetails.service;

import syncX.modules.CompanyAdmin.CompanyDetails.dto.CompanyDetailsUpdateRequest;
import syncX.modules.CompanyAdmin.CompanyDetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.CompanyDetails.repository.CompanyDetailsRepository;
import syncX.modules.CompanyAdmin.CompanyDetails.repository.CompanyRepository;
import syncX.modules.auth.entity.Company;
import syncX.modules.candidateprofile.service.SupabaseStorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class CompanyDetailsService {

    // Must match the bucket name used inside SupabaseStorageService.uploadCompanyLogo
    private static final String PICTURE_BUCKET = "cprofile_picture";

    private final CompanyDetailsRepository companyDetailsRepository;
    private final CompanyRepository companyRepository;

    @Autowired
    private SupabaseStorageService storageService;

    public CompanyDetailsService(
            CompanyDetailsRepository companyDetailsRepository,
            @Qualifier("companyDetailsModuleCompanyRepository") CompanyRepository companyRepository) {
        this.companyDetailsRepository = companyDetailsRepository;
        this.companyRepository = companyRepository;
    }


    public UUID getCompanyIdByUserId(UUID userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No company found for user: " + userId));
        return company.getCompanyId();
    }


    public CompanyDetails getCompanyDetails(UUID companyId) {
        return companyDetailsRepository
                .findByCompanyId(companyId)
                .orElseGet(() -> initFromCompany(companyId));
    }


    private CompanyDetails initFromCompany(UUID companyId) {
        Company company = companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new RuntimeException(
                        "Company not found in companies table for companyId: " + companyId));

        CompanyDetails details = new CompanyDetails();
        details.setCompanyId(companyId);
        details.setCompanyName(company.getCompanyName());
        details.setCompanyEmail(company.getCompanyEmail());
        details.setIndustry(company.getIndustry());
        details.setCompanySize(company.getCompanySize());
        details.setUpdatedAt(LocalDateTime.now());

        return companyDetailsRepository.save(details);
    }


    public CompanyDetails updateCompanyDetails(UUID companyId,
                                               CompanyDetailsUpdateRequest request,
                                               MultipartFile logoFile) {

        CompanyDetails details = companyDetailsRepository
                .findByCompanyId(companyId)
                .orElseGet(() -> initFromCompany(companyId));

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

        // Handle logo upload
        if (logoFile != null && !logoFile.isEmpty()) {
            String logoUrl = uploadLogoToStorage(companyId, details, logoFile);
            details.setLogoUrl(logoUrl);
        }

        details.setUpdatedAt(LocalDateTime.now());

        // TEMP DEBUG — confirms the entity's location field right before save().
        // Remove once the bug is confirmed fixed.
        System.out.println("[DEBUG] About to save companyLocation = [" + details.getCompanyLocation() + "]");

        CompanyDetails savedDetails = companyDetailsRepository.save(details);

        // Sync shared fields back to companies table
        syncToCompaniesTable(companyId, request);

        return savedDetails;
    }


    private void syncToCompaniesTable(UUID companyId, CompanyDetailsUpdateRequest request) {
        Company company = companyRepository.findByCompanyId(companyId)
                .orElse(null);

        if (company == null) {
            return;
        }

        boolean changed = false;

        if (request.getCompanyName() != null) {
            company.setCompanyName(request.getCompanyName());
            changed = true;
        }
        if (request.getIndustry() != null) {
            company.setIndustry(request.getIndustry());
            changed = true;
        }
        if (request.getCompanySize() != null) {
            company.setCompanySize(request.getCompanySize());
            changed = true;
        }
        if (request.getCompanyEmail() != null) {
            company.setCompanyEmail(request.getCompanyEmail());
            changed = true;
        }

        if (changed) {
            company.setUpdatedAt(OffsetDateTime.now());
            companyRepository.save(company);
        }
    }


    public CompanyDetails updateLogo(UUID companyId, MultipartFile logoFile) {

        CompanyDetails details = companyDetailsRepository
                .findByCompanyId(companyId)
                .orElseGet(() -> initFromCompany(companyId));

        if (logoFile != null && !logoFile.isEmpty()) {
            String logoUrl = uploadLogoToStorage(companyId, details, logoFile);
            details.setLogoUrl(logoUrl);
        }

        details.setUpdatedAt(LocalDateTime.now());

        return companyDetailsRepository.save(details);
    }


    /**
     * Actually uploads the logo file to Supabase Storage (previously this
     * was a TODO stub that just returned a fake, non-existent URL — which is
     * why logos never displayed). Deletes the old logo first if present.
     */
    private String uploadLogoToStorage(UUID companyId, CompanyDetails details, MultipartFile file) {
        try {
            String oldUrl = details.getLogoUrl();
            if (oldUrl != null && !oldUrl.isBlank() && !oldUrl.startsWith("blob:")) {
                String oldFileName = extractFileNameFromUrl(oldUrl, PICTURE_BUCKET);
                if (oldFileName != null) {
                    storageService.deleteFile(PICTURE_BUCKET, oldFileName);
                }
            }

            String ext = getExtension(file.getOriginalFilename());
            String uniqueFileName = "company_" + companyId + "_" + System.currentTimeMillis() + ext;

            return storageService.uploadCompanyLogo(file, uniqueFileName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload company logo: " + e.getMessage(), e);
        }
    }

    private String extractFileNameFromUrl(String url, String encodedBucket) {
        if (url == null) return null;
        String marker = "/public/" + encodedBucket + "/";
        int idx = url.indexOf(marker);
        if (idx >= 0) {
            return url.substring(idx + marker.length());
        }
        return null;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}