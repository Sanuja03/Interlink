package syncX.modules.CompanyAdmin.profileview.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.profileview.dto.*;
import syncX.modules.CompanyAdmin.profileview.entity.*;
import syncX.modules.CompanyAdmin.profileview.repository.*;

import java.util.List;
import java.util.UUID;

@Service
public class CandidateProfileService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    public CandidateProfileDTO getCandidateProfile(UUID candidateId) {

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        List<Experience> experiences =
                experienceRepository.findByCandidateId(candidateId);

        List<ExperienceDTO> expList = experiences.stream().map(exp -> {
            ExperienceDTO dto = new ExperienceDTO();
            dto.setJobTitle(exp.getJobTitle());
            dto.setCompany(exp.getCompanyName());
            dto.setStartDate(exp.getStartDate());
            dto.setEndDate(exp.getEndDate());
            return dto;
        }).toList();

        CandidateProfileDTO dto = new CandidateProfileDTO();
        dto.setFullName(candidate.getFirstName() + " " + candidate.getLastName());
        dto.setEmail(candidate.getEmail());
        dto.setPhone(candidate.getPhone());
        dto.setLocation(candidate.getLocation());
        dto.setExperiences(expList);

        return dto;
    }
}