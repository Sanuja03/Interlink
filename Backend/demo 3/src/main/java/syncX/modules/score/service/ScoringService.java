package syncX.modules.score.service;

import org.springframework.stereotype.Service;
import syncX.modules.job.entity.Job;
import syncX.modules.job.entity.JobRequirement;

import java.util.List;

@Service
public class ScoringService {

    public double skillScore(List<String> cvSkills, List<JobRequirement> reqs) {

        List<String> required = reqs.stream()
                .map(r -> r.getRequirement().toLowerCase())
                .toList();

        int match = 0;

        for (String s : cvSkills) {
            if (required.contains(s.toLowerCase())) {
                match++;
            }
        }

        if (required.isEmpty()) return 1;

        return (double) match / required.size();
    }

    public double experienceScore(double cvExp, double reqExp) {
        if (reqExp == 0) return 1;
        return Math.min(cvExp / reqExp, 1);
    }

    private int level(String edu) {
        edu = edu.toLowerCase();

        if (edu.contains("phd")) return 4;
        if (edu.contains("master")) return 3;
        if (edu.contains("degree")) return 2;
        if (edu.contains("diploma")) return 1;

        return 0;
    }

    public double educationScore(String cvEdu, String reqEdu) {
        int c = level(cvEdu);
        int r = level(reqEdu);

        if (r == 0) return 1;

        return Math.min((double) c / r, 1);
    }

    public double finalScore(double skill, double exp, double edu) {
        return (skill * 50) + (exp * 30) + (edu * 20);
    }
}