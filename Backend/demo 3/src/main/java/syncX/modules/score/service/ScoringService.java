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

    // CHANGED — old skillScore() renamed/kept as fallback; new overload below uses AI matches.
    /**
     * Fallback skill scorer using only hardcoded SKILL_GROUPS + exact matching.
     * Kept in case AI matching is unavailable.
     */
    public double skillScoreFallback(List<String> cvSkills, List<JobRequirement> reqs) {

        if (cvSkills == null || cvSkills.isEmpty()) {
            return 0;
        }

        if (reqs == null || reqs.isEmpty()) {
            return 0;
        }

        List<String> required = reqs.stream()
                .map(r -> r.getRequirement().toLowerCase())
                .toList();

        int match = 0;

        for (String req : required) {

            boolean found = false;

            for (String cv : cvSkills) {

                if (cv == null || req == null) continue;

                if (cv.equalsIgnoreCase(req)) {
                    found = true;
                    break;
                }

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

    /**
     * ADDED — Skill scorer driven by AI's semantic matching judgment.
     * AI decides WHICH required skills are satisfied (handles synonyms like
     * Postgres/PostgreSQL, Next.js/React). This method just counts —
     * the actual math stays deterministic and auditable.
     *
     * @param reqs            job's required skills (from DB)
     * @param aiMatchedSkills required-skill strings the AI judged as satisfied
     */
    public double skillScore(List<JobRequirement> reqs, List<String> aiMatchedSkills) {

        if (reqs == null || reqs.isEmpty()) {
            System.out.println("[SCORING] No job requirements found — skillScore = 0");
            return 0;
        }

        List<String> required = reqs.stream()
                .map(r -> r.getRequirement().toLowerCase())
                .toList();

        if (required.isEmpty()) return 1;

        if (aiMatchedSkills == null) aiMatchedSkills = List.of();

        List<String> matchedLower = aiMatchedSkills.stream()
                .filter(s -> s != null)
                .map(String::toLowerCase)
                .toList();

        int match = 0;
        for (String req : required) {
            if (matchedLower.contains(req)) match++;
        }

        double score = (double) match / required.size();

        // ADDED — terminal logging
        System.out.println("[SCORING] Required skills:   " + required);
        System.out.println("[SCORING] AI matched skills:  " + matchedLower);
        System.out.println("[SCORING] Skill match count:  " + match + "/" + required.size());
        System.out.println("[SCORING] Skill score:        " + (score * 100) + "%");

        return score;
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

        double score;
        if (reqExp == 0) {
            score = 1;  //everyone qualifies
        } else {
            score = Math.min(cvExp / reqExp, 1);   //capped at 1
        }

        // ADDED — terminal logging
        System.out.println("[SCORING] CV experience:      " + cvExp + " years");
        System.out.println("[SCORING] Required experience: " + reqExp + " years");
        System.out.println("[SCORING] Experience score:    " + (score * 100) + "%");

        return score;
    }

    private int level(String edu) {

        // ===== VALIDATION ADDED =====
        if (edu == null || edu.isEmpty()) {
            return 0;
        }
        // ============================

        edu = edu.toLowerCase();

        // CHANGED — recognizes bachelor's/bsc/b.tech/b.eng in addition to the original terms
        if (edu.contains("phd") || edu.contains("doctorate")) return 4;
        if (edu.contains("master") || edu.contains("msc") || edu.contains("m.sc")) return 3;
        if (edu.contains("bachelor") || edu.contains("bsc") || edu.contains("b.sc")
                || edu.contains("degree") || edu.contains("b.eng") || edu.contains("beng")
                || edu.contains("b.tech")) return 2;
        if (edu.contains("diploma") || edu.contains("hnd")) return 1;

        return 0;
    }

    public double educationScore(String cvEdu, String reqEdu) {

        // ===== VALIDATION ADDED =====
        if (cvEdu == null) cvEdu = "";
        if (reqEdu == null) reqEdu = "";
        // ============================

        int c = level(cvEdu);
        int r = level(reqEdu);

        double score;
        if (r == 0) {
            score = 1;
        } else {
            score = Math.min((double) c / r, 1);
        }

        // ADDED — terminal logging
        System.out.println("[SCORING] CV education:       \"" + cvEdu + "\" -> level " + c);
        System.out.println("[SCORING] Required education:  \"" + reqEdu + "\" -> level " + r);
        System.out.println("[SCORING] Education score:     " + (score * 100) + "%");

        return score;
    }

    public double finalScore(double skill, double exp, double edu) {

        // ===== VALIDATION ADDED =====
        if (skill < 0 || exp < 0 || edu < 0) {
            throw new RuntimeException("Invalid score values");
        }
        // ============================

        double result = (skill * 50) + (exp * 30) + (edu * 20);

        // ADDED — terminal logging
        System.out.println("[SCORING] ---------------------------------------------");
        System.out.println("[SCORING] Final Score = (Skill×50) + (Exp×30) + (Edu×20)");
        System.out.println("[SCORING]            = (" + (skill*100) + "%×0.5) + (" + (exp*100) + "%×0.3) + (" + (edu*100) + "%×0.2)");
        System.out.println("[SCORING]            = " + result);
        System.out.println("[SCORING] ---------------------------------------------\n");

        return result;
    }
}