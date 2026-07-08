package syncX.modules.questiongenerator.util;

import java.util.List;

public class PromptBuilder {

    public static String buildQuestionGenerationPrompt(String title, String description, List<String> requirements) {
        StringBuilder reqsBuilder = new StringBuilder();
        if (requirements != null && !requirements.isEmpty()) {
            for (String req : requirements) {
                reqsBuilder.append("- ").append(req).append("\n");
            }
        } else {
            reqsBuilder.append("- Standard technical and problem-solving skills matching the role.\n");
        }

        return """
        You are a seasoned technical interviewer.
        Generate exactly 5 challenging, relevant, and precise interview questions for the following role:
        
        Job Title: %s
        Job Description: %s
        Key Knowledge Requirements:
        %s
        
        STRICT OUTPUT FORMAT RULES:
        - Return ONLY a valid JSON array of strings containing exactly 5 questions.
        - Example format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
        - Do NOT include any markdown formatting, no "```json", no "```", and no conversational introduction or conclusion.
        - Ensure questions test the specific knowledge requirements listed above.
        """.formatted(title, description != null ? description : "", reqsBuilder.toString());
    }

    public static String buildEvaluationPrompt(String question, String answer) {
        return """
        You are a technical interviewer evaluating a candidate's answer to an interview question.
        
        Question:
        %s
        
        Candidate's Answer:
        %s
        
        STRICT RULES:
        - Assess the completeness, correctness, and accuracy of the answer.
        - Assign a score between 0 and 100 based on the evaluation.
        - Return ONLY a valid JSON object matching the format: {"score": X} where X is an integer.
        - Do NOT return markdown formatting like "```json" or "```", and no additional text/explanations.
        """.formatted(question, answer);
    }
}
