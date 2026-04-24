package syncX.modules.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class CategoryConverter implements AttributeConverter<Category, String> {

    @Override
    public String convertToDatabaseColumn(Category category) {
        return category == null ? null : category.name();
    }

    @Override
    public Category convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        try {
            // toUpperCase handles both old PascalCase DB values ("Engineering" → "ENGINEERING")
            // and any already-uppercase values — bad values like "IT" will throw and return null
            return Category.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            // DB has an invalid/unknown category value — return null to skip this row
            return null;
        }
    }
}
