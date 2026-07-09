package syncX.modules.SuperAdmin.Admin_interviews.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import syncX.modules.SuperAdmin.Admin_interviews.dto.AdminInterviewCandidateDto;
import syncX.modules.SuperAdmin.Admin_interviews.dto.AdminInterviewDto;
import syncX.modules.SuperAdmin.Admin_interviews.entity.AdminInterviewScheduled;
import syncX.modules.SuperAdmin.Admin_interviews.repository.AdminInterviewRepository;

import syncX.modules.SuperAdmin.Admin_users.entity.AdminCandidateSkill;
import syncX.modules.SuperAdmin.Admin_users.repository.AdminCandidateRepository;
import syncX.modules.SuperAdmin.Admin_users.repository.AdminCandidateSkillsRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminInterviewService {

    private final AdminInterviewRepository repo;
    private final AdminCandidateRepository candidateRepository;
    private final AdminCandidateSkillsRepository candidateSkillsRepository;

    // Fetch paginated interviews with optional filters
    public Page<AdminInterviewDto> getInterviews(String search, String status, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        search = (search == null) ? "" : search;
        status = (status == null) ? "" : status;

        return repo.searchInterviews(search, status, pageable)
                .map(this::mapToDto);
    }

    // Get total count of interviews
    public long getTotalCount() {
        return repo.count();
    }

    // Convert entity to DTO
    private AdminInterviewDto mapToDto(AdminInterviewScheduled i) {
        return new AdminInterviewDto(
                i.getScheduledId(),
                i.getInterviewId(),
                i.getInterviewDate(),
                i.getInterviewTime(),
                i.getMode(),
                i.getMeetingLink(),
                i.getAdminNotes(),
                i.getStatus(),
                i.getPanelSize(),
                i.getCandidateId(),
                i.getCompanyId()
        );
    }

    // Get candidate profile (USED by frontend)
    public AdminInterviewCandidateDto getCandidateById(UUID candidateId) {

        var candidate = candidateRepository.findById(candidateId).orElse(null);

        if (candidate == null) return null;

        // Fetch candidate skills
        List<String> skills = candidateSkillsRepository
                .findByCandidateId(candidateId)
                .stream()
                .map(AdminCandidateSkill::getSkillId)
                .collect(Collectors.toList());

        return AdminInterviewCandidateDto.builder()
                .candidateId(candidate.getCandidateId())
                .firstName(candidate.getFirstName())
                .lastName(candidate.getLastName())
                .email(candidate.getEmail())
                .location(candidate.getLocation())
                .workMode(candidate.getWorkMode())
                .dateOfBirth(candidate.getDateOfBirth())
                .skills(skills)
                .build();
    }
}