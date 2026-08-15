package syncX.modules.CompanyAdmin.AiQuestionScore.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import syncX.modules.CompanyAdmin.AiQuestionScore.dto.AiQuestionScoreDTO;
import syncX.modules.CompanyAdmin.AiQuestionScore.dto.QaPairDTO;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AiQuestionScoreService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
    private static final int RECOMMEND_THRESHOLD = 70;

    private final JdbcTemplate jdbc;

    public AiQuestionScoreService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Fetches the AI interview question/answer history for a candidate + job,
     * most recent session first. Each row in ai_question_scores holds every
     * question and answer of one AI interview session joined together with
     * "\n\n", which is split back out here into individual Q&A pairs.
     */
    public List<AiQuestionScoreDTO> getHistory(UUID candidateId, Long jobId) {
        String sql =
                "SELECT id, question, answer, score, saved_at " +
                        "FROM public.ai_question_scores " +
                        "WHERE candidate_id = ? AND job_id = ? " +
                        "ORDER BY saved_at DESC";

        return jdbc.query(sql, new Object[]{ candidateId, jobId }, (rs, rowNum) -> {
            AiQuestionScoreDTO dto = new AiQuestionScoreDTO();
            dto.setId(rs.getLong("id"));
            dto.setCandidateId(candidateId);
            dto.setJobId(jobId);

            int score = rs.getInt("score");
            dto.setScore(score);
            dto.setRecommended(score > RECOMMEND_THRESHOLD);

            Timestamp savedAt = rs.getTimestamp("saved_at");
            dto.setSavedAt(savedAt != null ? savedAt.toLocalDateTime().format(DATE_FORMAT) : null);

            dto.setQaPairs(splitQaPairs(rs.getString("question"), rs.getString("answer")));
            return dto;
        });
    }

    private List<QaPairDTO> splitQaPairs(String joinedQuestions, String joinedAnswers) {
        List<QaPairDTO> pairs = new ArrayList<>();

        String[] questions = joinedQuestions != null ? joinedQuestions.split("\\n\\n+") : new String[0];
        String[] answers = joinedAnswers != null ? joinedAnswers.split("\\n\\n+") : new String[0];

        int count = Math.max(questions.length, answers.length);
        for (int i = 0; i < count; i++) {
            String q = i < questions.length ? questions[i].trim() : "";
            String a = i < answers.length ? answers[i].trim() : "";
            if (q.isEmpty() && a.isEmpty()) continue;
            pairs.add(new QaPairDTO(q, a));
        }

        // Fallback: nothing could be split (e.g. no delimiter present) — show as a single pair
        if (pairs.isEmpty() && (joinedQuestions != null || joinedAnswers != null)) {
            pairs.add(new QaPairDTO(joinedQuestions, joinedAnswers));
        }

        return pairs;
    }
}
