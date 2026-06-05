package syncX.modules.Scorecard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import syncX.modules.Scorecard.entity.ScorecardTemplate;
import syncX.modules.Scorecard.entity.ScorecardTemplateField;
import syncX.modules.Scorecard.repository.ScorecardTemplateRepository;
import syncX.modules.auth.repository.CompanyRepository;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/company/scorecards")
public class ScorecardController {

    @Autowired ScorecardTemplateRepository repo;
    @Autowired CompanyRepository companyRepo;

    private UUID resolveCompanyId(Jwt jwt) {
        UUID uid = UUID.fromString(jwt.getSubject());
        return companyRepo.findByUserId(uid)
                .orElseThrow(() -> new RuntimeException("Company not found"))
                .getCompanyId();
    }


    @GetMapping
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<List<Map<String, Object>>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long jobId) {

        UUID companyId = resolveCompanyId(jwt);
        List<ScorecardTemplate> templates =
                repo.findByCompanyIdAndJobIdOrderByCreatedAtDesc(companyId, jobId);

        List<Map<String, Object>> result = templates.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }


    @PostMapping
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body) {

        UUID companyId   = resolveCompanyId(jwt);
        UUID adminUserId = UUID.fromString(jwt.getSubject());

        ScorecardTemplate t = new ScorecardTemplate();
        t.setCompanyId(companyId);
        t.setJobId(Long.valueOf(body.get("jobId").toString()));
        t.setTemplateName(body.get("templateName").toString());
        t.setCreatedByAdminId(adminUserId);
        t.setFinalized(false);
        applyFields(t, (List<Map<String, Object>>) body.get("fields"));

        return ResponseEntity.ok(toResponse(repo.save(t)));
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        ScorecardTemplate t = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        if (!t.getCompanyId().equals(resolveCompanyId(jwt)))
            return ResponseEntity.status(403).body(Map.of("error", "Not your scorecard"));
        if (t.isFinalized())
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot edit a finalized template"));

        t.setTemplateName(body.get("templateName").toString());
        t.getFields().clear();
        applyFields(t, (List<Map<String, Object>>) body.get("fields"));

        return ResponseEntity.ok(toResponse(repo.save(t)));
    }


    @PatchMapping("/{id}/finalize")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> finalize(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {

        ScorecardTemplate t = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        if (!t.getCompanyId().equals(resolveCompanyId(jwt)))
            return ResponseEntity.status(403).body(Map.of("error", "Not your scorecard"));

        t.setFinalized(true);
        return ResponseEntity.ok(toResponse(repo.save(t)));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('company_admin')")
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {

        ScorecardTemplate t = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        if (!t.getCompanyId().equals(resolveCompanyId(jwt)))
            return ResponseEntity.status(403).body(Map.of("error", "Not your scorecard"));
        if (t.isFinalized())
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete a finalized template"));

        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }


    private void applyFields(ScorecardTemplate t, List<Map<String, Object>> inputs) {
        if (inputs == null) return;
        for (int i = 0; i < inputs.size(); i++) {
            Map<String, Object> fi = inputs.get(i);
            ScorecardTemplateField f = new ScorecardTemplateField();
            f.setTemplate(t);
            f.setFieldLabel(fi.get("fieldLabel").toString());
            f.setMaxScore(Short.parseShort(fi.get("maxScore").toString()));
            f.setDisplayOrder((short) i);
            t.getFields().add(f);
        }
    }

    private Map<String, Object> toResponse(ScorecardTemplate t) {
        List<Map<String, Object>> fields = t.getFields().stream().map(f -> {
            Map<String, Object> fm = new LinkedHashMap<>();
            fm.put("id",       f.getScorecardFieldId().toString());
            fm.put("label",    f.getFieldLabel());
            fm.put("maxScore", f.getMaxScore());
            return fm;
        }).collect(Collectors.toList());

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",        t.getScorecardTemplateId().toString());
        m.put("name",      t.getTemplateName());
        m.put("finalized", t.isFinalized());
        m.put("fields",    fields);
        return m;
    }
}