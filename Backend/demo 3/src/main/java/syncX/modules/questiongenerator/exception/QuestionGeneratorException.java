package syncX.modules.questiongenerator.exception;

public class QuestionGeneratorException extends RuntimeException {
    public QuestionGeneratorException(String message) {
        super(message);
    }

    public QuestionGeneratorException(String message, Throwable cause) {
        super(message, cause);
    }
}
