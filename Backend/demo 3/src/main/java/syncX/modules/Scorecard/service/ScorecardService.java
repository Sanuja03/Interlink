package syncX.modules.Scorecard.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import syncX.modules.Scorecard.entity.ScorecardTemplate;
import syncX.modules.Scorecard.entity.ScorecardTemplateField;
import syncX.modules.Scorecard.repository.ScorecardTemplateRepository;
import syncX.modules.auth.service.AuthContextService;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScorecardService {

    @Autowired private ScorecardTemplateRepository repo;
    @Autowired private AuthContextService authContext;

    //get all scorecards for this company id s for this job
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listForJob(Jwt jwt, Long jobId) {
        UUID companyId = authContext.getCompanyId(jwt);
        return repo.findByCompanyIdAndJobIdOrderByCreatedAtDesc(companyId, jobId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> create(Jwt jwt, Map<String, Object> body) {
        UUID companyId = authContext.getCompanyId(jwt);
        UUID adminUserId = authContext.getUserId(jwt);
        validateBody(body);

        ScorecardTemplate t = new ScorecardTemplate();
        t.setCompanyId(companyId);
        t.setJobId(Long.valueOf(body.get("jobId").toString()));
        t.setTemplateName(body.get("templateName").toString().trim());
        t.setCreatedByAdminId(adminUserId);
        t.setFinalized(false);
        applyFields(t, castFields(body));//converts json to db object and apply fields to score card template fields table

        return toResponse(repo.save(t));//saves to score card template table in db and returns that in json format to front end
    }

    @Transactional
    public Map<String, Object> update(Jwt jwt, UUID id, Map<String, Object> body) {
        ScorecardTemplate t = loadAndAuthorize(jwt, id);
        if (t.isFinalized()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot edit a finalized template");
        }
        validateBody(body);

        t.setTemplateName(body.get("templateName").toString().trim());
        t.getFields().clear();
        applyFields(t, castFields(body));

        return toResponse(repo.save(t));
    }

    private void validateBody(Map<String, Object> body) {
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body required");
        }
        Object name = body.get("templateName");
        if (name == null || name.toString().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "templateName is required");
        }
        Object fields = body.get("fields");
        if (!(fields instanceof List) || ((List<?>) fields).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field is required");
        }
    }

    @Transactional
    public Map<String, Object> finalizeTemplate(Jwt jwt, UUID id) {
        ScorecardTemplate t = loadAndAuthorize(jwt, id);
        t.setFinalized(true);
        return toResponse(repo.save(t));
    }

    //part 1- gets all fields of object t and  add id,label,maxscore for each and get all to list - part 2 create a main response object
    //add id,name.... and attach the part 1s fields list  and return full
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

    @Transactional
    public void delete(Jwt jwt, UUID id) {
        ScorecardTemplate t = loadAndAuthorize(jwt, id);
        if (t.isFinalized()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete a finalized template");
        }
        repo.delete(t);
    }

    private ScorecardTemplate loadAndAuthorize(Jwt jwt, UUID id) {
        ScorecardTemplate t = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Scorecard not found"));
        if (!t.getCompanyId().equals(authContext.getCompanyId(jwt))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your scorecard");
        }
        return t;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> castFields(Map<String, Object> body) {
        return (List<Map<String, Object>>) body.get("fields");
    }

    private void applyFields(ScorecardTemplate t, List<Map<String, Object>> inputs) {
        if (inputs == null) return;
        for (int i = 0; i < inputs.size(); i++) {
            Map<String, Object> fi = inputs.get(i);
            ScorecardTemplateField f = new ScorecardTemplateField();
            f.setTemplate(t);
            f.setFieldLabel(fi.get("fieldLabel").toString().trim());
            f.setMaxScore(Short.parseShort(fi.get("maxScore").toString()));
            f.setDisplayOrder((short) i);
            t.getFields().add(f);
        }
    }


}