// ============================================================
// FILE: src/main/java/syncX/security/SupabaseJwtRoleConverter.java (NEW)
// PURPOSE: Reads user role from DB based on JWT subject (user_id)
//          and converts it into Spring Security GrantedAuthority
// ============================================================
package syncX.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import syncX.modules.auth.entity.User;
import syncX.modules.auth.repository.UserRepository;

import java.util.*;

/**
 * Supabase JWTs don't carry your app's roles.
 * This converter:
 *   1. Extracts the user_id (sub claim) from the JWT
 *   2. Looks up the user in your DB
 *   3. Returns ROLE_{role} as a GrantedAuthority
 *
 * This allows you to use:
 *   - .hasAuthority("ROLE_company_admin") in SecurityConfig
 *   - @PreAuthorize("hasRole('company_admin')") on methods
 */
@Component
public class SupabaseJwtRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository repo) {
        SupabaseJwtRoleConverter.userRepository = repo;
    }

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        try {
            String userId = jwt.getSubject();
            if (userId == null) return authorities;

            Optional<User> userOpt = userRepository.findById(UUID.fromString(userId));
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // Suspended users get no authorities → 403 on all protected endpoints
                if ("suspended".equals(user.getAccountStatus())) {
                    return authorities;
                }

                String role = user.getRole();
                if (role != null && !role.isBlank()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                }
            }
        } catch (Exception e) {
            System.err.println("JWT role conversion failed: " + e.getMessage());
        }

        return authorities;
    }}