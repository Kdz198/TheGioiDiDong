package tgdd.org.productservice.model.dto;

import jakarta.annotation.Nullable;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
public class BrandRequest {
    @Nullable
    Integer branId;
    String name;
    String description;
    MultipartFile file;
}
