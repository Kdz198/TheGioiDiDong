package tgdd.org.productservice.service;

import tgdd.org.productservice.model.Product;
import tgdd.org.productservice.model.dto.ProductRequest;

import java.io.IOException;
import java.util.List;

public interface ProductService {
    List<Product> findAll();
    Product findById(int id);
    Product save(ProductRequest product) throws IOException;
    Product update(Product product);
    void deleteById(int id);
    List<Product> findByBrandId(int brandId);
    List<Product> findByCategoryId(int categoryId);
    List<Product> findActiveProducts();
    List<Product> findInactiveProducts();
    Product deductStock(int productId, int quantity);
    //void saveInventoryOrder();
}
