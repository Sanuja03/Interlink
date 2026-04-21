package syncX.modules.auth.service;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

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
        body.put("email_confirm", true);

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
}