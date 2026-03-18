package tgdd.org.productservice.service;

import org.springframework.web.multipart.MultipartFile;
import tgdd.org.productservice.model.dto.request.OrderRequest;
import tgdd.org.productservice.model.dto.request.ProductRequest;
import tgdd.org.productservice.model.dto.request.ProductUpdateRequest;
import tgdd.org.productservice.model.dto.response.ProductResponse;

import java.io.IOException;
import java.util.List;

public interface ProductService {
    List<ProductResponse> findAll();
    ProductResponse findById(int id);
    ProductResponse save(ProductRequest product, MultipartFile img, MultipartFile img2, MultipartFile img3, MultipartFile img4, MultipartFile img5) throws IOException;
    ProductResponse update(ProductUpdateRequest product, MultipartFile img, MultipartFile img2, MultipartFile img3, MultipartFile img4, MultipartFile img5) throws IOException;
    void deleteById(int id);
    List<ProductResponse> findByBrandId(int brandId);
    List<ProductResponse> findByCategoryId(int categoryId);
    List<ProductResponse> findActiveProducts();
    List<ProductResponse> findInactiveProducts();
    OrderRequest isStockAvailable(OrderRequest request);
    void deductStock(String orderCode);
    void restoreStock(String orderCode);
    List<ProductResponse> findByCate(int cateId);
}
