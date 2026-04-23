package syncX.modules.CompanyAdmin.profileview.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.profileview.dto.CandidateProfileDTO;
import syncX.modules.CompanyAdmin.profileview.service.CandidateProfileService;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5175") // 🔥 IMPORTANT FIX
public class CandidateProfileController {

    @Autowired
    private CandidateProfileService service;

    // 🔥 GET CANDIDATE PROFILE BY ID
    @GetMapping("/candidate/{id}")
    public ResponseEntity<CandidateProfileDTO> getProfile(@PathVariable UUID id) {
        CandidateProfileDTO profile = service.getCandidateProfile(id);
        return ResponseEntity.ok(profile);
    }
}