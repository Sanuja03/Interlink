package syncX.testendpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test-db")
public class DatabaseTestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public Map<String, Object> testConnection() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Simple query to test DB
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            response.put("status", "SUCCESS");
            response.put("database", "Connected");
            response.put("result", result);

        } catch (Exception e) {
            response.put("status", "FAILED");
            response.put("error", e.getMessage());
        }

        return response;
    }
}