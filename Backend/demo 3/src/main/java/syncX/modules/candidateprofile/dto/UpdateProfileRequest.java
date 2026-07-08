package syncX.modules.candidateprofile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for updating candidate personal information.
 * All fields are optional — only non-null values will be applied (PATCH semantics).
 */
@Data
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must be 50 characters or fewer")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must be 50 characters or fewer")
    private String lastName;

    @Pattern(
        regexp = "^$|^(?:\\+94[\\s\\-]?|94[\\s\\-]?|0[\\s\\-]?)(?:[0-9][\\s\\-]?){9}$",
        message = "Phone number must be a valid Sri Lankan number (e.g. 0771234567 or +94771234567)"
    )
    private String phone;

    @Size(max = 1000, message = "Bio must be 1000 characters or fewer")
    private String bio;

    @Size(max = 100, message = "Location must be 100 characters or fewer")
    private String location;

    @Past(message = "Date of birth must be in the past")
    private java.time.LocalDate dateOfBirth;

    @Size(max = 100, message = "Headline must be 100 characters or fewer")
    private String headline;
}
