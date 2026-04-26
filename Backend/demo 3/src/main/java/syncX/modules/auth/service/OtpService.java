package syncX.modules.auth.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Stores: email -> { otp, expiryTimeMillis }
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static final long OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

    public String generateOtp(String email) {
        // Generate random 6-digit OTP
        String otp = String.valueOf(100000 + (int)(Math.random() * 900000));
        System.out.println("Otp generated for email: " + otp + email);
        otpStore.put(email.toLowerCase(), new OtpEntry(otp, System.currentTimeMillis() + OTP_VALIDITY_MS));
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email.toLowerCase());
        if (entry == null) return false;
        if (System.currentTimeMillis() > entry.expiryTime) {
            otpStore.remove(email.toLowerCase());
            return false; // Expired
        }
        if (entry.otp.equals(otp)) {
            otpStore.remove(email.toLowerCase()); // One-time use
            return true;
        }
        return false;
    }

    private static class OtpEntry {
        String otp;
        long expiryTime;

        OtpEntry(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}