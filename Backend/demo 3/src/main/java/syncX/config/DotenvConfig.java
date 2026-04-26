package syncX.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class DotenvConfig {

    static {
        Dotenv dotenv = Dotenv.configure()
                .directory("Backend/demo 3")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        // 🔥 MATCH EXACT .env KEYS
        setIfNotNull("OPENAI_API_KEY", dotenv.get("OPENAI_API_KEY"));
        setIfNotNull("SERVICE_KEY", dotenv.get("SERVICE_KEY")); // ✅ FIXED
        setIfNotNull("SUPABASE_URL", dotenv.get("SUPABASE_URL"));
        setIfNotNull("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
    }

    private static void setIfNotNull(String key, String value) {
        if (value != null && !value.isEmpty()) {
            System.setProperty(key, value);
        } else {
            System.out.println("⚠️ Missing ENV variable: " + key);
        }
    }
}