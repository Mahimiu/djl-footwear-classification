package ch.zhaw.deeplearningjava.footwear;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Footwear Classification API", description = "Endpoints for footwear image classification using DJL")
public class ClassificationController {

    private Inference inference = new Inference();

    @GetMapping("/ping")
    @Operation(summary = "Health ping", description = "Simple ping to check if the app is running")
    public String ping() {
        return "Classification app is up and running!";
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Returns the application health status")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }

    @GetMapping("/info")
    @Operation(summary = "Model info", description = "Returns information about the loaded ML model")
    public Map<String, Object> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("modelName", Models.MODEL_NAME);
        response.put("imageWidth", Models.IMAGE_WIDTH);
        response.put("imageHeight", Models.IMAGE_HEIGHT);
        response.put("classes", getClasses());
        response.put("framework", "DeepJavaLibrary (DJL) with PyTorch");
        response.put("architecture", "ResNet50 (transfer learning)");
        return response;
    }

    @GetMapping("/classes")
    @Operation(summary = "Available classes", description = "Returns the list of classes the model can predict")
    public List<String> getClasses() {
        try {
            Path synsetPath = Paths.get("models", "synset.txt");
            return Files.readAllLines(synsetPath);
        } catch (Exception e) {
            return List.of("Boots", "Sandals", "Shoes", "Slippers");
        }
    }

    @PostMapping(path = "/analyze")
    @Operation(summary = "Classify image", description = "Upload an image and get classification probabilities")
    public String predict(@RequestParam("image") MultipartFile image) throws Exception {
        System.out.println(image);
        return inference.predict(image.getBytes()).toJson();
    }
}