
// PURPOSE: Role-based URL authorization + JWT auth

package syncX.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Enables @PreAuthorize on methods
public class SecurityConfig {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // ── Public: no login needed
                        .requestMatchers(
                                "/api/auth/complete-candidate-signup",
                                "/api/auth/complete-company-signup",
                                "/api/otp/**"
                        ).permitAll()

                        //Role-based endpoints
                        // ── Candidate endpoints ──
                        .requestMatchers("/api/candidate/**").hasAuthority("ROLE_candidate")

                        // ── Interviewer endpoints ──
                        .requestMatchers("/api/interviewer/**").hasAuthority("ROLE_interviewer")
                        .requestMatchers("/api/auth/interviewer/**").hasAuthority("ROLE_interviewer")

                        // ── Company admin endpoints ──
                        .requestMatchers("/api/company/**").hasAuthority("ROLE_company_admin")
                        .requestMatchers("/api/auth/interviewers/**").hasAuthority("ROLE_company_admin")
                        .requestMatchers("/api/auth/complete-interviewer-signup").hasAuthority("ROLE_company_admin")

                        // ── Super admin endpoints ──
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_super_admin")

                        // ── Shared endpoints (any loged in user)
                        .requestMatchers("/api/tickets/**").authenticated()
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/chat/**").authenticated()
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/activity-logs").authenticated()

                        // ── Everything else requires authentication(login) ──
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    /**
     * Converts the Supabase JWT into Spring Security authorities.
     * Since Supabase JWTs don't contain Spring roles, we look up the
     * user's role from the database and inject it as a granted authority.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new SupabaseJwtRoleConverter());
        return converter;
    }
}