package tgdd.org.productservice.model.dto.request;

import lombok.Data;


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
    boolean type;
    int originalPrice;
}
