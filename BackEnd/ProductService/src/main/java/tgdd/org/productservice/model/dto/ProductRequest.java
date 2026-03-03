package tgdd.org.productservice.model.dto;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;


@Data
public class ProductRequest {
    String name;
    String description;
    int price;
    int stockQuantity;
    MultipartFile img;
    boolean isActive;
    int versionId;
    int brandId;
    int categoryId;
}
