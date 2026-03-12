package tgdd.org.productservice.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import tgdd.org.productservice.model.Product;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductEventDto {
    List<MultipartFile> multipartFiles;
    int productId;
    String message;
}
