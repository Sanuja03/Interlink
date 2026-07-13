package syncX.modules.cv.service;

import syncX.modules.cv.util.CvExtractor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class CvService {

    @Autowired
    private AiService aiService;

    public Object processCV(MultipartFile file) throws Exception {

        String fileName = file.getOriginalFilename();

        if (fileName == null) {
            throw new Exception("Invalid file");
        }

        String text;

        if (fileName.endsWith(".pdf")) {
            text = CvExtractor.extractFromPDF(file);   //parsing and extraction functions in cv extractor
        } else if (fileName.endsWith(".docx")) {
            text = CvExtractor.extractFromDocx(file);
        } else {
            throw new Exception("Only PDF and DOCX supported");
        }

        // Clean text
        String cleanedText = cleanText(text);


        //  VALIDATION TO DETECT EMPTY CV 
        String lower = cleanedText.toLowerCase();

if (cleanedText.trim().length() < 30 ||
    (!lower.contains("education") &&
     !lower.contains("experience") &&
     !lower.contains("skills"))) {

    throw new Exception("Invalid CV: insufficient meaningful content");
}
        //  Send to AI and get the output
        String aiResponse = aiService.sendToAI(cleanedText);


        ObjectMapper mapper = new ObjectMapper();

        //to convert the received JSON text to java objects
        Map<String, Object> parsedData =
                mapper.readValue(aiResponse, Map.class);

        return parsedData;
    }

    private String cleanText(String text) {
        return text
                .replaceAll("\\s+", " ")
                .replaceAll("[^\\x00-\\x7F]", "");
    }
}