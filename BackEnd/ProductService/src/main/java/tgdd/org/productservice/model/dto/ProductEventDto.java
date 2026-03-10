package tgdd.org.productservice.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import tgdd.org.productservice.model.Product;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductEventDto {
    Product product;
    MultipartFile img;
    int index;
}
