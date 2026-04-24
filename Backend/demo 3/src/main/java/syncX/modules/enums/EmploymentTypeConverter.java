package syncX.modules.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class EmploymentTypeConverter implements AttributeConverter<EmploymentType, String> {

    @Override
    public String convertToDatabaseColumn(EmploymentType employmentType) {
        return employmentType == null ? null : employmentType.name();
    }

    @Override
    public EmploymentType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        try {
            return EmploymentType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // DB has an invalid/unknown employment type value — return null to skip this row
            return null;
        }
    }
}
