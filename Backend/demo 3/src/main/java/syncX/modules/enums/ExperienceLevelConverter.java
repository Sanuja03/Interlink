package syncX.modules.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ExperienceLevelConverter implements AttributeConverter<ExperienceLevel, String> {

    @Override
    public String convertToDatabaseColumn(ExperienceLevel experienceLevel) {
        return experienceLevel == null ? null : experienceLevel.name();
    }

    @Override
    public ExperienceLevel convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        try {
            // Handles DB values like "Mid Level", "MID LEVEL", "MID_LEVEL", "DIRECTOR" etc.
            // toUpperCase + replace spaces with _ so "Mid Level" → "MID_LEVEL"
            String normalized = dbData.trim().toUpperCase().replace(' ', '_');
            return ExperienceLevel.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            // DB has an invalid/unknown experience level — return null to skip this row
            return null;
        }
    }
}
