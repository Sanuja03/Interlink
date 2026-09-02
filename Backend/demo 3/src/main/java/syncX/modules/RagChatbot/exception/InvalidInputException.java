package syncX.modules.RagChatbot.exception;

import lombok.Getter;

/**
 * Thrown when a user's chatbot message fails basic input validation
 * (blank/empty, or exceeds the configured max character length).
 */
@Getter
public class InvalidInputException extends RuntimeException {

    public enum Reason {
        BLANK,
        TOO_LONG
    }

    private final Reason reason;
    private final int maxLength; // when reason == TOO_LONG

    public InvalidInputException(String message, Reason reason, int maxLength) {
        super(message);
        this.reason = reason;
        this.maxLength = maxLength;
    }
}