package tgdd.org.productservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tgdd.org.productservice.model.Product;
import tgdd.org.productservice.model.dto.ProductRequest;
import tgdd.org.productservice.model.dto.ProductResponse;
import tgdd.org.productservice.model.dto.ProductUpdateRequest;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // ===== CREATE: ProductRequest -> Product =====
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quantity", ignore = true)
    @Mapping(target = "reserve", ignore = true)
    @Mapping(target = "imgUrl", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    Product toProduct(ProductRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quantity", ignore = true)
    @Mapping(target = "reserve", ignore = true)
    @Mapping(target = "imgUrl", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateProductFromRequest(ProductUpdateRequest request, @MappingTarget Product product);

    @Mapping(target = "versionName", source = "version.versionName")
    @Mapping(target = "brandName", source = "brand.name")
    @Mapping(target = "categoryName", source = "category.name")
    ProductResponse toProductResponse(Product product);

    List<ProductResponse> toProductResponseList(List<Product> products);
}

