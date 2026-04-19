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

@Service
public class JobService {

    @Autowired
    private AiService aiService;

    @Autowired
    private JobRepository jobRepo;

    @Autowired
    private JobRequirementRepository reqRepo;

    private ObjectMapper mapper = new ObjectMapper();

    public Job createJob(JobRequestDto dto) throws Exception {

        String aiResponse = aiService.extractJobData(dto.getRequirementText());

        System.out.println("===== RAW AI RESPONSE =====");
        System.out.println(aiResponse);

        JobAiDto aiData = mapper.readValue(aiResponse, JobAiDto.class);

        System.out.println("===== PARSED JOB DATA =====");
        System.out.println("Skills: " + aiData.getSkills());
        System.out.println("Experience Required: " + aiData.getExperienceRequired());
        System.out.println("Education Required: " + aiData.getEducationRequired());

        Job job = new Job();
        job.setTitle(dto.getTitle());
        job.setExperienceRequired(aiData.getExperienceRequired());
        job.setEducationRequired(aiData.getEducationRequired());

        Job saved = jobRepo.save(job);

        for (String skill : aiData.getSkills()) {
            JobRequirement r = new JobRequirement();
            r.setJob(saved);
            r.setRequirement(skill.toLowerCase());
            reqRepo.save(r);
        }
        List<JobRequirement> reqs = reqRepo.findByJobId(saved.getId());
        saved.setRequirements(reqs);

        return saved;
    }
}