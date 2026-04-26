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
import syncX.modules.subscription.entity.ActiveSubscription;
import syncX.modules.subscription.entity.SubscriptionPlan;
import syncX.modules.subscription.repository.ActiveSubscriptionRepository;

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

    @Autowired
    private ActiveSubscriptionRepository activeSubscriptionRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    public Job createJob(JobRequestDto dto) throws Exception {

        String rawText = dto.getRequirementText();
        if (rawText == null || rawText.trim().isEmpty()) {
            throw new Exception("Key requirements cannot be empty");
        }

        // ── SUBSCRIPTION JOB LIMIT CHECK ──────────────────────────────────
        if (dto.getCompanyId() != null && !dto.getCompanyId().isBlank()) {
            UUID companyId = UUID.fromString(dto.getCompanyId());

            ActiveSubscription activeSub = activeSubscriptionRepository
                    .findByCompanyId(companyId)
                    .orElseThrow(() -> new RuntimeException("No active subscription found for this company"));

            SubscriptionPlan plan = activeSub.getPlan();
            Integer jobLimit = plan.getActiveJobs();

            if (jobLimit != null) {
                long openJobCount = jobRepo.countByCompanyIdAndStatus(companyId, "Open");
                if (openJobCount >= jobLimit) {
                    throw new RuntimeException(
                            "Job post limit reached. Your " + plan.getName() +
                                    " plan allows " + jobLimit + " active job posts."
                    );
                }
            }
        }
        // ─────────────────────────────────────────────────────────────────

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
        job.setExperienceRequired(aiData.getExperienceRequired());
        job.setEducationRequired(aiData.getEducationRequired());

        if (dto.getCompanyId() != null && !dto.getCompanyId().isBlank()) {
            try {
                job.setCompanyId(UUID.fromString(dto.getCompanyId()));
            } catch (IllegalArgumentException e) {
                throw new Exception("Invalid company ID format");
            }
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
}