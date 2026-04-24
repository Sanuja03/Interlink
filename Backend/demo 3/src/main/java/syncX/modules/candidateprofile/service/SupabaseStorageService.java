package syncX.modules.candidateprofile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service.key:}")
    private String serviceKey;

    private static final String BUCKET_NAME = "cresume";

    /**
     * Uploads a file to the Supabase 'cresume' storage bucket.
     * Returns the public URL of the uploaded file.
     */
    public String uploadFile(MultipartFile file, String fileName) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        // Build upload URL
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + BUCKET_NAME + "/" + fileName;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set("x-upsert", "true"); // Overwrite if same filename exists

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        if (response.getStatusCode().is2xxSuccessful()) {
            // Return the public URL
            return supabaseUrl + "/storage/v1/object/public/" + BUCKET_NAME + "/" + fileName;
        } else {
            throw new Exception("Failed to upload file to Supabase. Status: " + response.getStatusCode());
        }
    }
}
