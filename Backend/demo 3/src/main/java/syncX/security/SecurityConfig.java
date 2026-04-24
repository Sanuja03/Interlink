package syncX.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
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

                        // ✅ TEMP FIX (ALLOW APPLICATION MANAGEMENT)
                        .requestMatchers("/api/company/applications/**").permitAll()

                        // ── Public ──
                        .requestMatchers(
                                "/api/auth/complete-candidate-signup",
                                "/api/auth/complete-company-signup",
                                "/api/otp/**"
                        ).permitAll()

                        // ── Candidate ──
                        .requestMatchers("/api/candidate/**").hasAuthority("ROLE_candidate")

                        // ── Interviewer ──
                        .requestMatchers("/api/interviewer/**").hasAuthority("ROLE_interviewer")

                        // ── Company Admin ──
                        .requestMatchers("/api/company/**").hasAuthority("ROLE_company_admin")
                        .requestMatchers("/api/auth/interviewers/**").hasAuthority("ROLE_company_admin")
                        .requestMatchers("/api/auth/complete-interviewer-signup").hasAuthority("ROLE_company_admin")

                        // ── Special path fix ──
                        .requestMatchers("/company/**").hasAuthority("ROLE_company_admin")

                        // ── Super Admin ──
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_super_admin")

                        // ── Shared ──
                        .requestMatchers("/api/tickets/**").authenticated()
                        .requestMatchers("/api/auth/me").authenticated()

                        // ── Everything else ──
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new SupabaseJwtRoleConverter());
        return converter;
    }
}