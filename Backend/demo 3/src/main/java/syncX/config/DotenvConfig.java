package syncX.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class DotenvConfig {

    static {
        Dotenv dotenv = Dotenv.configure()
                .directory("Backend/demo 3")
                .ignoreIfMissing()
                .load();

        System.setProperty("OPENAI_API_KEY", dotenv.get("OPENAI_API_KEY"));
        System.setProperty("SUPABASE_SERVICE_KEY", dotenv.get("SUPABASE_SERVICE_KEY"));
        System.setProperty("SUPABASE_URL", dotenv.get("SUPABASE_URL"));
    }
}