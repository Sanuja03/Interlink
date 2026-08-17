package syncX.modules.auth.service;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SupabaseAdminService {

    /** Page size used when scanning the Supabase admin user list. */
    private static final int PAGE_SIZE = 200;

    /** Safety cap so a malformed response can never spin the pagination loop forever. */
    private static final int MAX_PAGES = 100;

    /** Avoids the unchecked cast that raw Map/List responses forced. */
    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() {};

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service.key}")
    private String serviceKey;

    @Autowired
    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        System.out.println("SERVICE KEY LOADED: "
                + (serviceKey != null && !serviceKey.isEmpty() ? "YES (length=" + serviceKey.length() + ")" : "NO - EMPTY!"));
    }

    /** Shared admin headers (service key auth). */
    private HttpHeaders adminHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(serviceKey);
        headers.set("apikey", serviceKey);
        return headers;
    }

    // used for interviewer account creation
    public String createUser(String email, String password) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required to create a Supabase user");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("password is required to create a Supabase user");
        }

        String url = supabaseUrl + "/auth/v1/admin/users"; // Supabase API endpoint to create a user

        // prepare the data of the interviewer to be sent to supabase to create the user
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);
        body.put("email_confirm", true); // skips email verification

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, adminHeaders());

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                MAP_TYPE
        );

        // Supabase can return 2xx with no body; never hand a null id back to the caller,
        // or we end up writing a null FK into users/interviewers.
        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null) {
            throw new IllegalStateException("Supabase returned an empty body when creating user " + email);
        }

        Object id = responseBody.get("id");
        if (!(id instanceof String userId) || userId.isBlank()) {
            throw new IllegalStateException("Supabase response contained no user id for " + email);
        }

        return userId;
    }

    /**
     * Delete a Supabase auth user by id. Used to roll back the external auth
     * account when the follow-up DB writes for a new interviewer fail, so we
     * never leave an orphaned auth user with no matching users/interviewers row.
     */
    public void deleteUser(String userId) {
        if (userId == null || userId.isBlank()) return;

        String url = supabaseUrl + "/auth/v1/admin/users/" + userId;

        HttpEntity<Void> request = new HttpEntity<>(adminHeaders());

        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);

        System.out.println("[Supabase] Deleted auth user " + userId);
    }

    /**
     * Preferred password update path: we already persist the Supabase user id at
     * creation time, so pass it in and skip the admin list scan entirely.
     */
    public void updateUserPasswordById(String userId, String newPassword) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required to update a password");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("newPassword is required");
        }

        String updateUrl = supabaseUrl + "/auth/v1/admin/users/" + userId;

        Map<String, Object> body = new HashMap<>();
        body.put("password", newPassword);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, adminHeaders());

        restTemplate.exchange(updateUrl, HttpMethod.PUT, request, MAP_TYPE);

        System.out.println("[Supabase] Password updated for auth user " + userId);
    }

    /**
     * Email-based fallback for callers that do not have the Supabase user id to hand.
     * Prefer {@link #updateUserPasswordById(String, String)} — this one walks every
     * page of the admin user list and gets more expensive as the tenant grows.
     */
    public void updateUserPassword(String email, String newPassword) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required to update a password");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("newPassword is required");
        }

        String userId = findUserIdByEmail(email);
        if (userId == null) {
            throw new RuntimeException("User not found in Supabase");
        }

        updateUserPasswordById(userId, newPassword);
    }

    /**
     * Walks the Supabase admin user list page by page. The original code built a
     * paginated URL and then requested the bare endpoint, so it only ever saw the
     * first default-sized page and reported "not found" for everyone past it.
     *
     * @return the auth user id, or null if no user matches the address.
     */
    private String findUserIdByEmail(String email) {
        HttpEntity<Void> request = new HttpEntity<>(adminHeaders());

        for (int page = 1; page <= MAX_PAGES; page++) {
            String listUrl = UriComponentsBuilder
                    .fromHttpUrl(supabaseUrl + "/auth/v1/admin/users")
                    .queryParam("page", page)
                    .queryParam("per_page", PAGE_SIZE)
                    .toUriString();

            ResponseEntity<Map<String, Object>> listResponse = restTemplate.exchange(
                    listUrl,
                    HttpMethod.GET,
                    request,
                    MAP_TYPE
            );

            Map<String, Object> body = listResponse.getBody();
            if (body == null) return null;

            // Pattern-match instead of casting blind: a missing or unexpected
            // "users" value means we are done, not that we should throw.
            if (!(body.get("users") instanceof List<?> users) || users.isEmpty()) {
                return null;
            }

            for (Object entry : users) {
                if (!(entry instanceof Map<?, ?> user)) continue;

                // email is non-null (validated above), so this comparison is safe
                // in the direction the original code had it backwards-risky.
                if (user.get("email") instanceof String userEmail
                        && email.equalsIgnoreCase(userEmail)
                        && user.get("id") instanceof String id
                        && !id.isBlank()) {
                    return id;
                }
            }

            // Short page means this was the last one.
            if (users.size() < PAGE_SIZE) return null;
        }

        return null;
    }
}