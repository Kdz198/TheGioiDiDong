package tgdd.org.productservice.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
public class BrandRequest {
    String name;
    String description;
    MultipartFile file;
}
