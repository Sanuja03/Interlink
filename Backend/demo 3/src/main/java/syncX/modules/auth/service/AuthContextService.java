package syncX.modules.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import syncX.modules.auth.entity.Company;
import syncX.modules.auth.repository.CompanyRepository;

import java.util.UUID;

/**
 * Centralized JWT → user/company resolution.
 * Any controller or service needing the caller's company,uuid, companyid should use this.
 */
@Service
public class AuthContextService {

    @Autowired
    private CompanyRepository companyRepository;

    //get user id(subject)  from jwt and convert to uuid and return it
    public UUID getUserId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    //users company
    public Company getCompany(Jwt jwt) {
        UUID userId = getUserId(jwt);
        return companyRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Company not found for user: " + userId));
    }

    //companies compnayid
    public UUID getCompanyId(Jwt jwt) {
        return getCompany(jwt).getCompanyId();
    }
}