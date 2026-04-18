package syncX.modules.SuperAdmin.Admin_settings.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import syncX.modules.SuperAdmin.Admin_settings.entity.SASettings;
import syncX.modules.SuperAdmin.Admin_settings.service.SASettingsService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "http://localhost:5173")
public class SASettingsController {

    @Autowired
    private SASettingsService service;

    @GetMapping("/{category}")
    public List<SASettings> getSettings(@PathVariable String category) {
        return service.getSettings(category);
    }

    @PostMapping("/{category}")
    public List<SASettings> saveSettings(
            @PathVariable String category,
            @RequestBody List<SASettings> settings) {

        return service.saveSettings(category, settings);
    }
}