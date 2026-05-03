package syncX.modules.SuperAdmin.Admin_settings.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import syncX.modules.SuperAdmin.Admin_settings.dto.*;
import syncX.modules.SuperAdmin.Admin_settings.service.SASettingsService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class SASettingsController {

    private final SASettingsService service;

    // GET Settings
    @GetMapping("/{category}")
    public List<SASettingsDto> getSettings(@PathVariable String category) {
        return service.getSettings(category);
    }

    // SAVE Settings
    @PostMapping("/{category}")
    public List<SASettingsDto> saveSettings(
            @PathVariable String category,
            @RequestBody List<SaveSettingsDto> settings) {

        return service.saveSettings(category, settings);
    }
}