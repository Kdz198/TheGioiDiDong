package tgdd.org.productservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.model.Product;
import tgdd.org.productservice.repo.ProductRepo;
import tgdd.org.productservice.service.ProductService;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Override
    public List<Product> findAll() {
        return productRepo.findAll();
    }

    @Override
    public Product findById(int id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    public Product save(Product product) {
        return productRepo.save(product);
    }

    @Override
    public Product update( Product product) {
        if(!productRepo.existsById(product.getId())) {
            throw new RuntimeException("Product not found with id: " + product.getId());
        }
        return productRepo.save(product);
    }

    @Override
    public void deleteById(int id) {
        productRepo.deleteById(id);
    }

    @Override
    public List<Product> findByBrandId(int brandId) {
        return productRepo.findByBrandId(brandId);
    }

    @Override
    public List<Product> findByCategoryId(int categoryId) {
        return productRepo.findByCategoryId(categoryId);
    }

    @Override
    public List<Product> findActiveProducts() {
        return productRepo.findByIsActiveTrue();
    }

    @Override
    public List<Product> findInactiveProducts() {
        return productRepo.findByIsActiveFalse();
    }
}
