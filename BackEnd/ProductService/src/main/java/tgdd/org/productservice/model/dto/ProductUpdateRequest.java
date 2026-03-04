package tgdd.org.productservice.model.dto;

import jakarta.annotation.Nullable;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductUpdateRequest {
    int id;
    String name;
    String description;
    Integer price;
    Integer stockQuantity;
    @Nullable
    MultipartFile img;
    Boolean active;
    Integer versionId;
    Integer brandId;
    Integer categoryId;
}

