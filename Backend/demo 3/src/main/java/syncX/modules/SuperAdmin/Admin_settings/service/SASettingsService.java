package syncX.modules.SuperAdmin.Admin_settings.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import syncX.modules.SuperAdmin.Admin_settings.entity.SASettings;
import syncX.modules.SuperAdmin.Admin_settings.repository.SASettingsRepository;

import java.util.List;

@Service
public class SASettingsService {

    @Autowired
    private SASettingsRepository repo;

    public List<SASettings> getSettings(String category) {
        return repo.findByCategory(category);
    }

    public List<SASettings> saveSettings(String category, List<SASettings> settings) {

        // delete old ones (simple clean approach)
        List<SASettings> existing = repo.findByCategory(category);
        repo.deleteAll(existing);

        settings.forEach(s -> s.setCategory(category));

        return repo.saveAll(settings);
    }
}