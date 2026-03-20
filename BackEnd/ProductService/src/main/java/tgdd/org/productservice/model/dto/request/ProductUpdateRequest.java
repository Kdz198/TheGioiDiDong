package tgdd.org.productservice.model.dto.request;

import lombok.Data;

@Data
public class ProductUpdateRequest {
    int id;
    String name;
    String description;
    Integer price;
    Integer stockQuantity;
    Boolean active;
    Integer versionId;
    Integer brandId;
    Integer categoryId;
    int originalPrice;
}

