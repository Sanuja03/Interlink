package syncX.modules.score.service;

import org.springframework.stereotype.Service;
import syncX.modules.job.entity.JobRequirement;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;

@Service
public class ScoringService {
    private static final Map<String, List<String>> SKILL_GROUPS = new HashMap<>();

    static {

        // Frontend
        SKILL_GROUPS.put("react", Arrays.asList("react", "next.js"));
        SKILL_GROUPS.put("angular", Arrays.asList("angular"));
        SKILL_GROUPS.put("vue", Arrays.asList("vue", "nuxt.js"));
        SKILL_GROUPS.put("frontend", Arrays.asList("html", "css", "javascript"));

        // Backend
        SKILL_GROUPS.put("java", Arrays.asList("java", "spring", "spring boot"));
        SKILL_GROUPS.put("node", Arrays.asList("node.js", "express", "javascript"));
        SKILL_GROUPS.put("python", Arrays.asList("python", "django", "flask"));
        SKILL_GROUPS.put("php", Arrays.asList("php", "laravel"));

        // Database
        SKILL_GROUPS.put("sql", Arrays.asList("mysql", "postgresql", "sql server", "oracle"));
        SKILL_GROUPS.put("nosql", Arrays.asList("mongodb", "firebase"));

        // Cloud / DevOps
        SKILL_GROUPS.put("cloud", Arrays.asList("aws", "azure", "gcp"));
        SKILL_GROUPS.put("devops", Arrays.asList("docker", "kubernetes", "jenkins"));

        // Soft skills
        SKILL_GROUPS.put("communication", Arrays.asList("communication", "teamwork"));
        SKILL_GROUPS.put("problem solving", Arrays.asList("problem solving", "debugging"));
    }

    public double skillScore(List<String> cvSkills, List<JobRequirement> reqs) {

        // ===== VALIDATION ADDED =====
        if (cvSkills == null || cvSkills.isEmpty()) {
            return 0;
        }

        if (reqs == null || reqs.isEmpty()) {
            return 0;
        }
        // ============================

        List<String> required = reqs.stream()
                .map(r -> r.getRequirement().toLowerCase())
                .toList();

        int match = 0;

        for (String req : required) {

            boolean found = false;

            for (String cv : cvSkills) {

                // ===== VALIDATION ADDED =====
                if (cv == null || req == null) continue;
                // ============================

                // Direct match
                if (cv.equalsIgnoreCase(req)) {
                    found = true;
                    break;
                }

                //  Group match
                if (SKILL_GROUPS.containsKey(req)) {
                    List<String> group = SKILL_GROUPS.get(req);

                    if (group.contains(cv.toLowerCase())) {
                        found = true;
                        break;
                    }
                }
            }

            if (found) match++;
        }

        if (required.isEmpty()) return 1;

        return (double) match / required.size();
    }

    public double experienceScore(double cvExp, double reqExp) {

        // ===== VALIDATION ADDED =====
        if (cvExp < 0) {
            throw new RuntimeException("Invalid CV experience value");
        }

        if (reqExp < 0) {
            throw new RuntimeException("Invalid job experience requirement");
        }
        // ============================

        if (reqExp == 0) return 1;

        return Math.min(cvExp / reqExp, 1);
    }

    private int level(String edu) {

        // ===== VALIDATION ADDED =====
        if (edu == null || edu.isEmpty()) {
            return 0;
        }
        // ============================

        edu = edu.toLowerCase();

        if (edu.contains("phd")) return 4;
        if (edu.contains("master")) return 3;
        if (edu.contains("degree")) return 2;
        if (edu.contains("diploma")) return 1;

        return 0;
    }

    public double educationScore(String cvEdu, String reqEdu) {

        // ===== VALIDATION ADDED =====
        if (cvEdu == null) cvEdu = "";
        if (reqEdu == null) reqEdu = "";
        // ============================

        int c = level(cvEdu);
        int r = level(reqEdu);

        if (r == 0) return 1;

        return Math.min((double) c / r, 1);
    }

    public double finalScore(double skill, double exp, double edu) {

        // ===== VALIDATION ADDED =====
        if (skill < 0 || exp < 0 || edu < 0) {
            throw new RuntimeException("Invalid score values");
        }
        // ============================

        return (skill * 50) + (exp * 30) + (edu * 20);
    }
}