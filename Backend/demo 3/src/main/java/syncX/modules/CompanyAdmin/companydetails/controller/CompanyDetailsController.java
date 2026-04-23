package syncX.modules.CompanyAdmin.companydetails.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import syncX.modules.CompanyAdmin.companydetails.entity.CompanyDetails;
import syncX.modules.CompanyAdmin.companydetails.service.CompanyDetailsService;

import java.util.UUID;

@RestController
@RequestMapping("/company/details")
@CrossOrigin(origins = "http://localhost:5175")
public class CompanyDetailsController {

    @Autowired
    private CompanyDetailsService service;

    // 🔥 GET DETAILS
    @GetMapping("/{companyId}")
    public CompanyDetails getDetails(@PathVariable UUID companyId) {
        return service.getDetails(companyId);
    }

    // 🔥 UPDATE DETAILS
    @PutMapping("/{companyId}")
    public CompanyDetails updateDetails(
            @PathVariable UUID companyId,
            @RequestBody CompanyDetails data) {

        return service.updateDetails(companyId, data);
    }
}