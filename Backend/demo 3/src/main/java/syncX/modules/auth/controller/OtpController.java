package syncX.modules.auth.controller;

import syncX.modules.auth.service.OtpService;
import syncX.modules.auth.service.SupabaseAdminService;
import syncX.modules.auth.repository.UserRepository;
import syncX.common.util.InterLinkMailSender;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupabaseAdminService supabaseAdminService;


    @PostMapping("/send-signup-otp")
    public ResponseEntity<?> sendSignupOtp(@RequestBody Map<String, String> body) {//data from frontend will be stored in key value pairs
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        // Check if email already registered
        if (userRepository.existsByEmail(email.trim())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        String otp = otpService.generateOtp(email.trim());


        new Thread(() -> InterLinkMailSender.sendSignupOTP(email.trim(), otp)).start();

        return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
    }

    // Verify signup OTP
    @PostMapping("/verify-signup-otp")
    public ResponseEntity<?> verifySignupOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
        }

        boolean valid = otpService.verifyOtp(email.trim(), otp.trim());
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    // Send OTP for forgot password
    @PostMapping("/send-reset-otp")
    public ResponseEntity<?> sendResetOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        // Only send if user exists (but always return success message for security)
        if (userRepository.existsByEmail(email.trim())) {
            String otp = otpService.generateOtp(email.trim());
            new Thread(() -> InterLinkMailSender.sendPasswordResetOTP(email.trim(), otp)).start();
        }

        // Always return success
        return ResponseEntity.ok(Map.of("message", "If this email is registered, you'll receive a reset code"));
    }

    // Verify reset OTP
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
        }

        boolean valid = otpService.verifyOtp(email.trim(), otp.trim());
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    // Reset password (after OTP verified)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String newPassword = body.get("newPassword");

        if (email == null || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Valid email and password (8+ chars) required"));
        }

        try {
            supabaseAdminService.updateUserPassword(email.trim(), newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to update password"));
        }
    }
}