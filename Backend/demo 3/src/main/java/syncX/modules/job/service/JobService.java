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

    // ================= CREATE =================
    public Job createJob(JobRequestDto dto) throws Exception {

        String rawText = dto.getRequirementText();
        if (rawText == null || rawText.trim().isEmpty()) {
            throw new Exception("Key requirements cannot be empty");
        }

        String aiResponse = aiService.extractJobData(rawText);
        JobAiDto aiData = mapper.readValue(aiResponse, JobAiDto.class);

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

        job.setExperienceRequired(aiData.getExperienceRequired());
        job.setEducationRequired(aiData.getEducationRequired());

        if (dto.getCompanyId() != null && !dto.getCompanyId().isBlank()) {
            job.setCompanyId(UUID.fromString(dto.getCompanyId()));
        }

        Job saved = jobRepo.save(job);

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

    // ================= READ =================
    public List<Job> getJobsByCompany(String companyId) {
        UUID uuid = UUID.fromString(companyId);
        return jobRepo.findByCompanyId(uuid);
    }

    public Job getJobById(String jobId) {
        Long id = Long.parseLong(jobId);
        return jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    // ================= UPDATE ( NEW) =================
    public Job updateJob(Long jobId, JobRequestDto dto) throws Exception {

        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Update fields (match create logic)
        job.setJobTitle(dto.getTitle());
        job.setDepartment(dto.getDepartment());
        job.setEmploymentType(dto.getType());
        job.setCategory(dto.getCategory());
        job.setJobLocation(dto.getLocation());
        job.setExperienceLevel(dto.getExperience());
        job.setVacancies(dto.getVacancies());
        job.setInterviewRounds(dto.getInterviewRounds());
        job.setInterviewStages(dto.getInterviewStages());
        job.setKeyRequirements(dto.getRequirementText());

        // Optional: update company if provided
        if (dto.getCompanyId() != null && !dto.getCompanyId().isBlank()) {
            job.setCompanyId(UUID.fromString(dto.getCompanyId()));
        }

        return jobRepo.save(job);
    }

    // ================= TOGGLE =================
    public Job toggleJobStatus(String jobId) {
        Long id = Long.parseLong(jobId);

        Job job = jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if ("Open".equalsIgnoreCase(job.getStatus())) {
            job.setStatus("Closed");
        } else {
            job.setStatus("Open");
        }

        return jobRepo.save(job);
    }

    // ================= DELETE =================
    public void deleteJob(String jobId) {
        Long id = Long.parseLong(jobId);

        Job job = jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        jobRepo.delete(job);
    }
}