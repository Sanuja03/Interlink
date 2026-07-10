package syncX.modules.CompanyAdmin.CandidateProfile.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.CandidateProfile.dto.CandidateProfileResponseDTO;
import syncX.modules.CompanyAdmin.CandidateProfile.service.CandidateProfileService;

import java.util.UUID;

@RestController
@RequestMapping("/api/company/candidate-profile")
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    public CandidateProfileController(CandidateProfileService profileService) {
        this.profileService = profileService;
    }

    // GET candidate profile
    // Example: /api/company/candidate-profile/{candidateId}?applicationId=15
    @GetMapping("/{candidateId}")
    public ResponseEntity<CandidateProfileResponseDTO> getProfile(
            @PathVariable UUID candidateId,
            @RequestParam(required = false) Long applicationId) {

        CandidateProfileResponseDTO profile =
                profileService.getCandidateProfile(candidateId, applicationId);
        return ResponseEntity.ok(profile);
    }
}