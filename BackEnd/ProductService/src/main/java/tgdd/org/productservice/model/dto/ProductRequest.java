package tgdd.org.productservice.model.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;


@Data
public class ProductRequest {
    String name;
    String description;
    int price;
    int stockQuantity;
    boolean active;
    int versionId;
    int brandId;
    int categoryId;
}
