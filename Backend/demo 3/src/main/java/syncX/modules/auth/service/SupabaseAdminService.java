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

    public String createUser(String email, String password) {

        String url = supabaseUrl + "/auth/v1/admin/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(serviceKey);
        headers.set("apikey", serviceKey);

        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);
        body.put("email_confirm", true); //cuz of this no need to confirm email

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                Map.class
        );

        Map responseBody = response.getBody();
        return (String) responseBody.get("id");
    }

    // Add this method to SupabaseAdminService.java

    public void updateUserPassword(String email, String newPassword) {
        // First, find user by email
        String listUrl = supabaseUrl + "/auth/v1/admin/users?page=1&per_page=1";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(serviceKey);
        headers.set("apikey", serviceKey);

        // Get all users and find by email (Supabase admin API)
        ResponseEntity<Map> listResponse = restTemplate.exchange(
                supabaseUrl + "/auth/v1/admin/users",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        List<Map<String, Object>> users = (List<Map<String, Object>>) listResponse.getBody().get("users");
        String userId = null;

        for (Map<String, Object> user : users) {
            if (email.equalsIgnoreCase((String) user.get("email"))) {
                userId = (String) user.get("id");
                break;
            }
        }

        if (userId == null) {
            throw new RuntimeException("User not found in Supabase");
        }

        // Update password
        String updateUrl = supabaseUrl + "/auth/v1/admin/users/" + userId;

        Map<String, Object> body = new HashMap<>();
        body.put("password", newPassword);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        restTemplate.exchange(updateUrl, HttpMethod.PUT, request, Map.class);

        System.out.println("[Supabase] Password updated for " + email);
    }
}