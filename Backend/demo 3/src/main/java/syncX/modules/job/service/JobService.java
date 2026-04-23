package syncX.modules.job.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.cv.service.AiService;
import syncX.modules.job.dto.JobAiDto;
import syncX.modules.job.dto.JobRequestDto;
import syncX.modules.job.entity.Job;
import syncX.modules.job.entity.JobRequirement;
import syncX.modules.job.repository.JobRepository;
import syncX.modules.job.repository.JobRequirementRepository;

import java.util.List;
import java.util.UUID;

@Service
public class JobService {

    @Autowired
    private AiService aiService;

    @Autowired
    private JobRepository jobRepo;

    @Autowired
    private JobRequirementRepository reqRepo;

    private final ObjectMapper mapper = new ObjectMapper();

    public Job createJob(JobRequestDto dto) throws Exception {

        String rawText = dto.getRequirementText();
        if (rawText == null || rawText.trim().isEmpty()) {
            throw new Exception("Key requirements cannot be empty");
        }

        // AI extraction
        String aiResponse = aiService.extractJobData(rawText);
        JobAiDto aiData = mapper.readValue(aiResponse, JobAiDto.class);

        // Build Job entity
        Job job = new Job();
        job.setJobTitle(dto.getTitle());
        job.setDepartment(dto.getDepartment());
        job.setEmploymentType(dto.getType());
        job.setCategory(dto.getCategory());
        job.setJobLocation(dto.getLocation());
        job.setExperienceLevel(dto.getExperience());
        job.setVacancies(dto.getVacancies());
        job.setInterviewRounds(dto.getInterviewRounds());
        job.setInterviewStages(dto.getInterviewStages());
        job.setKeyRequirements(rawText);
        job.setStatus("Open");

        // ✅ AI-extracted fields now stored directly in jobs table
        job.setExperienceRequired(aiData.getExperienceRequired());
        job.setEducationRequired(aiData.getEducationRequired());

        // Company ID
        if (dto.getCompanyId() != null && !dto.getCompanyId().isBlank()) {
            try {
                job.setCompanyId(UUID.fromString(dto.getCompanyId()));
            } catch (IllegalArgumentException e) {
                throw new Exception("Invalid company ID format");
            }
        }

        Job saved = jobRepo.save(job);

        // Save extracted skills to job_requirement table
        if (aiData.getSkills() != null) {
            for (String skill : aiData.getSkills()) {
                if (skill == null || skill.trim().isEmpty()) continue;
                JobRequirement r = new JobRequirement();
                r.setJob(saved);
                r.setRequirement(skill.trim().toLowerCase());
                reqRepo.save(r);
            }
        }

        List<JobRequirement> reqs = reqRepo.findByJobId(saved.getId());
        saved.setRequirements(reqs);
        return saved;
    }
}