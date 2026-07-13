/*package syncX.modules.cv.controller;


import syncX.modules.cv.service.CvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/cv")
public class CvController {

    @Autowired
    private CvService cvService;
    

    @PostMapping("/upload")
public ResponseEntity<?> uploadCV(@RequestParam("file") MultipartFile file) {
    try {
        Object response = cvService.processCV(file);   //send to service for processing
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
}
}*/