package tgdd.org.productservice.model.dto.request;

import jakarta.annotation.Nullable;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class BrandRequest {
    @Nullable
    Integer branId;
    String name;
    String description;
    MultipartFile file;
}
