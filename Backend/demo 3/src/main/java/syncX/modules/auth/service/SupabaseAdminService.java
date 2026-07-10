package syncX.modules.auth.service;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.List;

import java.util.HashMap;
import java.util.Map;

@Service
public class SupabaseAdminService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service.key}")
    private String serviceKey;

    @Autowired
    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        System.out.println("SERVICE KEY LOADED: " + (serviceKey != null && !serviceKey.isEmpty() ? "YES (length=" + serviceKey.length() + ")" : "NO - EMPTY!"));
    }

    /** Shared admin headers (service key auth). */
    private HttpHeaders adminHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(serviceKey);
        headers.set("apikey", serviceKey);
        return headers;
    }

    //user for interviewer account creation
    public String createUser(String email, String password) {

        String url = supabaseUrl + "/auth/v1/admin/users";//Supabase API endpoint to create a user

        //request headers - confirm teh security/authenticity of the person whos making the account
        HttpHeaders headers = adminHeaders();

        //preapre the data of teh interviewer to be sent to supabase to create the user
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);
        body.put("email_confirm", true); //cuz of this no need to confirm email it skips email verification

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        //Send HTTP POST request to Supabase
        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                Map.class
        );

        //Get the data Supabase sent back
        Map responseBody = response.getBody();
        //Take the user ID from response and return it
        return (String) responseBody.get("id");
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

        restTemplate.exchange(url, HttpMethod.DELETE, request, Map.class);

        System.out.println("[Supabase] Deleted auth user " + userId);
    }

    public void updateUserPassword(String email, String newPassword) {
        // First, find user by email
        String listUrl = supabaseUrl + "/auth/v1/admin/users?page=1&per_page=1";

        HttpHeaders headers = adminHeaders();

        // Send HTTP GET request to Supabase to get all users existing
        ResponseEntity<Map> listResponse = restTemplate.exchange(
                supabaseUrl + "/auth/v1/admin/users",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        //put the recived users in to a list
        List<Map<String, Object>> users = (List<Map<String, Object>>) listResponse.getBody().get("users");
        String userId = null;

        //loop through each and find teh email and get their userid
        for (Map<String, Object> user : users) {
            if (email.equalsIgnoreCase((String) user.get("email"))) {
                userId = (String) user.get("id");
                break;
            }
        }

        if (userId == null) {
            throw new RuntimeException("User not found in Supabase");
        }

        // Update the specific users password
        String updateUrl = supabaseUrl + "/auth/v1/admin/users/" + userId;

        Map<String, Object> body = new HashMap<>();
        body.put("password", newPassword);

        //send the updated users password  to supabase
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        restTemplate.exchange(updateUrl, HttpMethod.PUT, request, Map.class);

        System.out.println("[Supabase] Password updated for " + email);
    }
}