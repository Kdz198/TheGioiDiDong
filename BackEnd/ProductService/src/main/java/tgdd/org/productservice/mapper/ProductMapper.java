package tgdd.org.productservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tgdd.org.productservice.model.Brand;
import tgdd.org.productservice.model.Category;
import tgdd.org.productservice.model.Product;
import tgdd.org.productservice.model.ProductVersion;
import tgdd.org.productservice.model.dto.ProductRequest;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quantity", ignore = true)
    @Mapping(target = "imgUrl", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    Product toProduct(ProductRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quantity", ignore = true)
    @Mapping(target = "imgUrl", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    void updateProduct(ProductRequest request, @MappingTarget Product product);

    default Product toProduct(ProductRequest request, ProductVersion version, Brand brand, Category category, String imgUrl) {
        Product product = toProduct(request);
        product.setVersion(version);
        product.setBrand(brand);
        product.setCategory(category);
        product.setImgUrl(imgUrl);
        return product;
    }

    default void updateProduct(ProductRequest request, @MappingTarget Product product, ProductVersion version, Brand brand, Category category, String imgUrl) {
        updateProduct(request, product);
        product.setVersion(version);
        product.setBrand(brand);
        product.setCategory(category);
        product.setImgUrl(imgUrl);
    }
}

