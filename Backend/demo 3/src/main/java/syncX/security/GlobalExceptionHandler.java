// ============================================================
// FILE: src/main/java/syncX/security/GlobalExceptionHandler.java (NEW)
// PURPOSE: Returns clean JSON error responses for auth failures
//          instead of Spring's default HTML error pages
// ============================================================
package syncX.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import syncX.modules.auth.exception.AccountSuspendedException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> Map.of(
                        "field", error.getField(),
                        "defaultMessage", error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value"
                ))
                .toList();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "Bad Request",
                        "message", "Validation failed",
                        "status", 400,
                        "errors", errors,
                        "timestamp", OffsetDateTime.now().toString()
                ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error", "Forbidden",
                        "message", "You do not have permission to access this resource",
                        "status", 403,
                        "timestamp", OffsetDateTime.now().toString()
                ));
    }

    @ExceptionHandler(AccountSuspendedException.class)
    public ResponseEntity<Map<String, Object>> handleSuspended(AccountSuspendedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error", "Forbidden",
                        "message", ex.getMessage(),
                        "status", 403,
                        "timestamp", OffsetDateTime.now().toString()
                ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;

        // Map specific messages to appropriate HTTP statuses
        String msg = ex.getMessage();
        if (msg != null) {
            if (msg.contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (msg.contains("Only company admins") || msg.contains("does not belong")) {
                status = HttpStatus.FORBIDDEN;
            } else if (msg.contains("already exists")) {
                status = HttpStatus.CONFLICT;
            }
        }

        return ResponseEntity
                .status(status)
                .body(Map.of(
                        "error", status.getReasonPhrase(),
                        "message", msg != null ? msg : "An error occurred",
                        "status", status.value(),
                        "timestamp", OffsetDateTime.now().toString()
                ));
    }
}