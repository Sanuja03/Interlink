package syncX.modules.jobapply.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;

/**
 * Handles CV/resume uploads to the Supabase 'resumes' bucket.
 * Only PDF files are accepted. Max size: 5 MB.
 */
@Service
public class JobApplicationStorageService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service.key:}")
    private String serviceKey;

    private static final String BUCKET = "resumes";
    private static final long MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_TYPES = Set.of("application/pdf");

    /**
     * Validates and uploads a PDF resume to Supabase 'resumes' bucket.
     * Returns the public URL.
     */
    public String uploadResume(MultipartFile file, String uniqueFileName) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Resume file must not be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only PDF files are allowed for job application resumes");
        }

        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Resume file must not exceed 5 MB");
        }

        return upload(file, uniqueFileName);
    }

    /**
     * Deletes a file from the resumes bucket. Silent on 404.
     */
    public void deleteResume(String fileName) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String encodedBucket = URLEncoder.encode(BUCKET, StandardCharsets.UTF_8).replace("+", "%20");
            String encodedFile   = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
            String url = supabaseUrl + "/storage/v1/object/" + encodedBucket + "/" + encodedFile;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceKey);
            headers.set("apikey", serviceKey);

            restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), String.class);
        } catch (Exception e) {
            System.err.println("[JobApplicationStorage] Delete warning: " + e.getMessage());
        }
    }

    // ── Private Helpers ──────────────────────────────────────────────────────────

    private String upload(MultipartFile file, String fileName) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        String encodedBucket = URLEncoder.encode(BUCKET, StandardCharsets.UTF_8).replace("+", "%20");
        String encodedFile   = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        String uploadUrl     = supabaseUrl + "/storage/v1/object/" + encodedBucket + "/" + encodedFile;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set("x-upsert", "true");

        HttpEntity<byte[]> request = new HttpEntity<>(file.getBytes(), headers);
        ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, request, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return supabaseUrl + "/storage/v1/object/public/" + encodedBucket + "/" + encodedFile;
        } else {
            throw new Exception("Failed to upload resume to Supabase. Status: " + response.getStatusCode());
        }
    }
}
