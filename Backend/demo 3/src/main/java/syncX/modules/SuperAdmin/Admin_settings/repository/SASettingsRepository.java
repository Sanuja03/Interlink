package syncX.modules.SuperAdmin.Admin_settings.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import syncX.modules.SuperAdmin.Admin_settings.entity.SASettings;

import java.util.List;

public interface SASettingsRepository extends JpaRepository<SASettings, Long> {
    List<SASettings> findByCategory(String category);
}