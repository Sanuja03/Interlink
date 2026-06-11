package syncX.modules.savedjobs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import syncX.modules.candidateprofile.entity.CandidateProfile;
import syncX.modules.candidateprofile.repository.CandidateProfileRepository;
import syncX.modules.jobpostdetails.entity.JobDetails;
import syncX.modules.jobpostdetails.repository.JobDetailsRepository;
import syncX.modules.savedjobs.dto.SavedJobDTO;
import syncX.modules.savedjobs.entity.SavedJob;
import syncX.modules.savedjobs.repository.SavedJobRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SavedJobService {

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private JobDetailsRepository jobDetailsRepository;

    @Transactional(readOnly = true)
    public List<SavedJobDTO> getSavedJobs(UUID userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<SavedJob> savedJobs = savedJobRepository.findByCandidateIdOrderBySavedAtDesc(profile.getId());

        List<Long> jobIds = savedJobs.stream().map(SavedJob::getJobId).collect(Collectors.toList());
        List<JobDetails> jobs = jobDetailsRepository.findAllById(jobIds);
        java.util.Map<Long, JobDetails> jobMap = jobs.stream()
                .collect(Collectors.toMap(JobDetails::getId, j -> j));

        return savedJobs.stream().map(savedJob -> {
            SavedJobDTO dto = new SavedJobDTO();
            dto.setId(savedJob.getId());
            dto.setJobId(savedJob.getJobId());
            dto.setSavedAt(savedJob.getSavedAt());

            JobDetails job = jobMap.get(savedJob.getJobId());
            if (job != null) {
                dto.setTitle(job.getTitle());
                dto.setCompany(job.getCompany());
                dto.setLogo(job.getLogo());
                dto.setLocation(job.getLocation());
                dto.setEmploymentType(job.getEmploymentType());
                dto.setCategory(job.getCategory());
                dto.setExperienceLevel(job.getExperienceLevel());
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public SavedJob saveJob(UUID userId, Long jobId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile();
                    newProfile.setUserId(userId);
                    return candidateProfileRepository.save(newProfile);
                });

        if (!jobDetailsRepository.existsById(jobId)) {
            throw new RuntimeException("Job not found");
        }

        if (savedJobRepository.existsByCandidateIdAndJobId(profile.getId(), jobId)) {
            throw new RuntimeException("Job already saved");
        }

        SavedJob savedJob = new SavedJob();
        savedJob.setCandidateId(profile.getId());
        savedJob.setJobId(jobId);

        return savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(UUID userId, Long jobId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        savedJobRepository.deleteByCandidateIdAndJobId(profile.getId(), jobId);
    }
    
    @Transactional(readOnly = true)
    public List<Long> getSavedJobIds(UUID userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        return savedJobRepository.findByCandidateIdOrderBySavedAtDesc(profile.getId())
                .stream()
                .map(SavedJob::getJobId)
                .collect(Collectors.toList());
    }
}
