package tgdd.org.productservice.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    int id;
    String name;
    String description;
    int price;
    int quantity;
    int reserve;
    String imgUrl;
    boolean active;
    String versionName;
    String brandName;
    String categoryName;
}

