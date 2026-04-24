package syncX.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Application-wide bean configuration.
 *
 * RestTemplate is defined as a singleton bean here so it is shared
 * across the application rather than being created on every API call.
 * This enables connection pooling and is the Spring-recommended pattern.
 *
 * If your project already has an AppConfig or WebConfig class,
 * just add the restTemplate() @Bean method there instead of
 * creating a new file.
 */
@Configuration
public class AppConfig {

    /**
     * Shared RestTemplate for all outbound HTTP calls (e.g. OpenAI API).
     * Injected into AiService via constructor injection.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
