package syncX.modules.candidateprofile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service.key:}")
    private String serviceKey;

    // Must match your exact Supabase bucket names
    private static final String RESUME_BUCKET = "c_resume";
    private static final String PICTURE_BUCKET = "cprofile_picture";
    private static final long MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final long MAX_PICTURE_BYTES = 2 * 1024 * 1024; // 2 MB

    private static final Set<String> ALLOWED_RESUME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private static final Set<String> ALLOWED_PICTURE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp");

    // ─────────────────────────────────── RESUME
    // ────────────────────────────────────

    /**
     * Validates and uploads a CV/resume file to the 'cresume' bucket.
     * Returns the public URL of the uploaded file.
     */
    public String uploadResume(MultipartFile file, String fileName) throws Exception {
        validateFile(file, ALLOWED_RESUME_TYPES, MAX_RESUME_BYTES,
                "Only PDF, DOC, and DOCX files are allowed for resumes",
                "Resume file size must not exceed 5 MB");
        return upload(file, RESUME_BUCKET, fileName);
    }

    // ─────────────────────────────── PROFILE PICTURE
    // ──────────────────────────────

    /**
     * Validates and uploads a profile picture to the 'profile-pics' bucket.
     * Returns the public URL of the uploaded file.
     */
    public String uploadProfilePicture(MultipartFile file, String fileName) throws Exception {
        validateFile(file, ALLOWED_PICTURE_TYPES, MAX_PICTURE_BYTES,
                "Only JPG, PNG, and WebP images are allowed for profile pictures",
                "Profile picture size must not exceed 2 MB");
        return upload(file, PICTURE_BUCKET, fileName);
    }

    // ─────────────────────────────────── DELETE
    // ────────────────────────────────────

    /**
     * Deletes a file from a Supabase storage bucket.
     * Silently ignores 404 (file already gone).
     */
    public void deleteFile(String bucket, String fileName) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String encodedBucket = URLEncoder.encode(bucket, StandardCharsets.UTF_8).replace("+", "%20");
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + encodedBucket + "/" + encodedFileName;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceKey);
            headers.set("apikey", serviceKey);

            java.net.URI deleteUri = java.net.URI.create(deleteUrl);
            restTemplate.exchange(deleteUri, HttpMethod.DELETE, new HttpEntity<>(headers), String.class);
            System.out.println("[Storage] Deleted " + bucket + "/" + fileName);
        } catch (Exception e) {
            // Log but do not throw — the file may have already been removed
            System.err.println("[Storage] Delete warning for " + bucket + "/" + fileName + ": " + e.getMessage());
        }
    }

    // ─────────────────────────────────── PRIVATE
    // ──────────────────────────────────

    private void validateFile(MultipartFile file,
            Set<String> allowedTypes,
            long maxBytes,
            String typeMessage,
            String sizeMessage) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new Exception("File must not be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new Exception(typeMessage);
        }

        if (file.getSize() > maxBytes) {
            throw new Exception(sizeMessage);
        }
    }

    private String upload(MultipartFile file, String bucket, String fileName) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        // URL-encode the bucket name to handle spaces (e.g. "candidate profile
        // picture")
        String encodedBucket = URLEncoder.encode(bucket, StandardCharsets.UTF_8).replace("+", "%20");
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + encodedBucket + "/" + encodedFileName;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set("x-upsert", "true");

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        java.net.URI uploadUri = java.net.URI.create(uploadUrl);
        ResponseEntity<String> response = restTemplate.exchange(
                uploadUri, HttpMethod.POST, requestEntity, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            // Public URL uses the encoded bucket name so browsers can resolve it
            return supabaseUrl + "/storage/v1/object/public/" + encodedBucket + "/" + encodedFileName;
        } else {
            throw new Exception("Failed to upload to Supabase. Status: " + response.getStatusCode());
        }
    }
}
