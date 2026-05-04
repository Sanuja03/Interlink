package syncX.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173"
        ));

        //front end requests can be only  below methods and the request cant inlcude the authorization header including the jwt
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));// frontend can send any header it wants. The most important one for you is the Authorization
        config.setExposedHeaders(List.of("Authorization"));//let the frontend read the Authorization header from my responses
        config.setAllowCredentials(true);//This allows cookies and auth headers to be included in cross-origin requests. Necessary because you're sending JWTs.

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);//applies all the above  rules to every URL on your backend
        return source;
    }
}