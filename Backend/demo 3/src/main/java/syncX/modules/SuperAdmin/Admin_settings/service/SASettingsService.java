package syncX.modules.SuperAdmin.Admin_settings.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import syncX.modules.SuperAdmin.Admin_settings.dto.*;
import syncX.modules.SuperAdmin.Admin_settings.entity.SASettings;
import syncX.modules.SuperAdmin.Admin_settings.repository.SASettingsRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SASettingsService {

    private final SASettingsRepository repo;

    //  GET SETTINGS
    public List<SASettingsDto> getSettings(String category) {
        return repo.findByCategory(category)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    //  SAVE SETTINGS
    public List<SASettingsDto> saveSettings(String category, List<SaveSettingsDto> settings) {

        // delete existing
        List<SASettings> existing = repo.findByCategory(category);
        repo.deleteAll(existing);

        // map DTO → Entity
        List<SASettings> newSettings = settings.stream()
                .map(dto -> {
                    SASettings s = new SASettings();
                    s.setCategory(category);
                    s.setKeyName(dto.keyName());
                    s.setValue(dto.value());
                    return s;
                })
                .toList();

        return repo.saveAll(newSettings)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    //  MAPPER
    private SASettingsDto mapToDto(SASettings s) {
        return new SASettingsDto(
                s.getId(),
                s.getKeyName(),
                s.getValue()
        );
    }
}