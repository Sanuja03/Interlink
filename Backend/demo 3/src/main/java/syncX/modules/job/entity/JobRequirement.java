package syncX.modules.job.entity;

import jakarta.persistence.*;

@Entity
public class JobRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String requirement;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    public String getRequirement() {
        return requirement;
    }

    public void setRequirement(String requirement) {
        this.requirement = requirement;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }
}