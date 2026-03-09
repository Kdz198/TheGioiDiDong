package tgdd.org.productservice.service;

import tgdd.org.productservice.model.dto.*;

import java.io.IOException;
import java.util.List;

public interface ProductService {
    List<ProductResponse> findAll();
    ProductResponse findById(int id);
    ProductResponse save(ProductRequest product) throws IOException;
    ProductResponse update(ProductUpdateRequest product) throws IOException;
    void deleteById(int id);
    List<ProductResponse> findByBrandId(int brandId);
    List<ProductResponse> findByCategoryId(int categoryId);
    List<ProductResponse> findActiveProducts();
    List<ProductResponse> findInactiveProducts();
    OrderRequest isStockAvailable(OrderRequest request);
    void deductStock(String orderCode);
    void restoreStock(String orderCode);
}
