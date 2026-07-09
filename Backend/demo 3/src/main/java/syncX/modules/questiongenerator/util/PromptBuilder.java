package syncX.modules.questiongenerator.util;

import java.util.List;

public class PromptBuilder {

    public static String buildQuestionGenerationPrompt(String title, List<String> retrievedChunks) {
        StringBuilder chunksBuilder = new StringBuilder();
        if (retrievedChunks != null && !retrievedChunks.isEmpty()) {
            for (int i = 0; i < retrievedChunks.size(); i++) {
                chunksBuilder.append(String.format("Context Chunk %d:\n%s\n\n", i + 1, retrievedChunks.get(i)));
            }
        } else {
            chunksBuilder.append("- Standard technical and problem-solving skills matching the role.\n");
        }

        return """
        You are a seasoned technical interviewer.
        Generate exactly 5 challenging, relevant, and precise interview questions for the following role:
        
        Job Title: %s
        
        Key Background Context/Requirements retrieved from database:
        %s
        
        STRICT OUTPUT FORMAT RULES:
        - Return ONLY a valid JSON array of strings containing exactly 5 questions.
        - Example format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
        - Do NOT include any markdown formatting, no "```json", no "```", and no conversational introduction or conclusion.
        - Ensure questions test the specific knowledge requirements and context listed above.
        """.formatted(title, chunksBuilder.toString());
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

    public static String buildEvaluationPromptWithContext(String question, String answer, List<String> retrievedChunks) {
        StringBuilder chunksBuilder = new StringBuilder();
        if (retrievedChunks != null && !retrievedChunks.isEmpty()) {
            for (int i = 0; i < retrievedChunks.size(); i++) {
                chunksBuilder.append(String.format("Context Chunk %d:\n%s\n\n", i + 1, retrievedChunks.get(i)));
            }
        } else {
            chunksBuilder.append("- Standard technical guidelines for this role.\n");
        }

        return """
        You are a technical interviewer evaluating a candidate's answer to an interview question.
        
        Question:
        %s
        
        Candidate's Answer:
        %s
        
        Key Background Context/Requirements retrieved from database to verify correctness:
        %s
        
        STRICT RULES:
        - Assess the completeness, correctness, and accuracy of the answer based on the provided retrieved context/requirements.
        - Assign a score between 0 and 100 based on the evaluation.
        - Return ONLY a valid JSON object matching the format: {"score": X} where X is an integer.
        - Do NOT return markdown formatting like "```json" or "```", and no additional text/explanations.
        """.formatted(question, answer, chunksBuilder.toString());
    }

    /**
     * Generate expected answer based on question and context chunks.
     */
    public static String buildExpectedAnswerPrompt(String question, List<String> retrievedChunks) {
        StringBuilder chunksBuilder = new StringBuilder();
        if (retrievedChunks != null && !retrievedChunks.isEmpty()) {
            for (int i = 0; i < retrievedChunks.size(); i++) {
                chunksBuilder.append(String.format("Context Chunk %d:\n%s\n\n", i + 1, retrievedChunks.get(i)));
            }
        } else {
            chunksBuilder.append("- Standard technical guidelines.\n");
        }

        return """
        You are a technical interviewer assistant.
        Generate a comprehensive, ideal expected answer to the following question.
        
        Question:
        %s
        
        Retrieved Context Chunks (Use ONLY this context to formulate the answer):
        %s
        
        STRICT RULES:
        1. Do not use external knowledge.
        2. Only include information directly supported by the retrieved context.
        3. Keep the expected answer clear, concise, and structured.
        4. Do not assume or extrapolate missing information.
        5. Return ONLY the expected answer text. No conversational prefix/suffix.
        """.formatted(question, chunksBuilder.toString());
    }

    /**
     * Grinds the evaluation using expected answer, retrieved context, and candidate answer.
     */
    public static String buildEvaluationPromptWithContext(String question, String answer, List<String> retrievedChunks, String expectedAnswer) {
        StringBuilder chunksBuilder = new StringBuilder();
        if (retrievedChunks != null && !retrievedChunks.isEmpty()) {
            for (int i = 0; i < retrievedChunks.size(); i++) {
                chunksBuilder.append(String.format("Context Chunk %d:\n%s\n\n", i + 1, retrievedChunks.get(i)));
            }
        } else {
            chunksBuilder.append("- Standard technical guidelines.\n");
        }

        return """
        You are a highly critical, strict, and precise technical interviewer evaluating a candidate's response.
        
        Question:
        %s
        
        Retrieved Context Chunks (Your absolute ground truth):
        %s
        
        Model/Expected Answer:
        %s
        
        Candidate's Answer to Evaluate:
        %s
        
        CRITICAL RELEVANCE & QUALITY RULES:
        - If the candidate's answer is completely irrelevant to the question, is empty/meaningless (e.g., "I don't know", "pass", "N/A", "test"), or contains only random letters/gibberish, you MUST award EXACTLY 0 marks for ALL rubric criteria. The final_score MUST be 0. Do not give any partial marks for communication or basic structure.
        - If the candidate answer states technically incorrect information or claims that contradict the expected answer or retrieved context, you MUST penalize heavily. Subtract marks for incorrect technical statements.
        
        EVALUATION RUBRIC (Total Max: 100 marks):
        1. Technical Accuracy (Max: 40 marks):
           - Only award marks for statements that are technically correct and directly match the expected answer.
           - Subtract/penalize heavily if the candidate states technically incorrect or inaccurate information.
           - If the answer is technically wrong or unrelated, award 0 marks.
        2. Coverage of Required Concepts (Max: 25 marks):
           - Assign marks proportionally to how many key concepts from the expected answer are correctly addressed.
           - If the candidate misses concepts or provides wrong explanations for them, award 0 marks for those concepts.
        3. Practical Understanding (Max: 15 marks):
           - Check if the candidate demonstrates correct practical application or real-world usage of the concepts.
           - Do not give marks if the understanding is shallow, incorrect, or absent.
        4. Communication & Clarity (Max: 10 marks):
           - Evaluate the logical structure and clarity of their answer.
           - IMPORTANT: If the candidate's content is technically wrong or irrelevant, you MUST award 0 marks here. Good writing of incorrect/gibberish information gets 0 marks.
        5. Best Practices (Max: 10 marks):
           - Check if the candidate mentions industry standard best practices that align with the context.
           - If not mentioned or incorrect, award 0 marks.
        
        STRICT GROUNDING & SCORING RULES:
        - Do not use external knowledge.
        - Only award marks based on the provided retrieved context and expected answer.
        - Do not assume missing information. If the candidate did not mention something, they did not know it.
        - Be conservative and strict. If the response is mediocre, score it low. If it is wrong, score it 0.
        
        STRICT OUTPUT FORMAT RULES:
        - Return ONLY a valid JSON object matching the JSON schema below.
        - Do NOT include any markdown code blocks, no "```json", no "```", and no extra text.
        - Return exactly this format:
        {
            "technical_accuracy": [integer between 0 and 40],
            "coverage": [integer between 0 and 25],
            "practical_understanding": [integer between 0 and 15],
            "communication": [integer between 0 and 10],
            "best_practices": [integer between 0 and 10],
            "strengths": ["Strength point 1", "Strength point 2"],
            "weaknesses": ["Weakness point 1", "Weakness point 2"],
            "missing_topics": ["Missing Topic 1", "Missing Topic 2"],
            "recommendations": ["Recommendation 1", "Recommendation 2"],
            "feedback": "Short summary feedback text",
            "final_score": [integer: sum of technical_accuracy, coverage, practical_understanding, communication, and best_practices]
        }
        """.formatted(question, chunksBuilder.toString(), expectedAnswer, answer);
    }
}
