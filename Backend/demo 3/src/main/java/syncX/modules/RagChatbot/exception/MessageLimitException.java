package syncX.modules.RagChatbot.exception;

/**
 * Thrown when a user has reached their daily message limit.
 */
public class MessageLimitException extends RuntimeException {
    public MessageLimitException(String message) {
        super(message);
    }
}