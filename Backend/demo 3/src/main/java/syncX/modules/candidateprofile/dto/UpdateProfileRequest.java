package syncX.modules.candidateprofile.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for updating candidate personal information.
 * All fields are optional — only non-null values will be applied (PATCH semantics).
 */
@Data
public class UpdateProfileRequest {

    @Size(max = 50, message = "First name must be 50 characters or fewer")
    private String firstName;

    @Size(max = 50, message = "Last name must be 50 characters or fewer")
    private String lastName;

    @Pattern(
        regexp = "^$|^\\+?[0-9\\s\\-()]{7,20}$",
        message = "Phone number must be 7-20 digits and may include +, spaces, dashes, or parentheses"
    )
    private String phone;

    @Size(max = 1000, message = "Bio must be 1000 characters or fewer")
    private String bio;

    @Size(max = 100, message = "Location must be 100 characters or fewer")
    private String location;

    private java.time.LocalDate dateOfBirth;

    @Size(max = 100, message = "Headline must be 100 characters or fewer")
    private String headline;
}
