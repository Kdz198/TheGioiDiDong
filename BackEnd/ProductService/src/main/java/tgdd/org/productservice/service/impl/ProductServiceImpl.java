package tgdd.org.productservice.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.mapper.ProductMapper;
import tgdd.org.productservice.model.Brand;
import tgdd.org.productservice.model.Category;
import tgdd.org.productservice.model.Product;
import tgdd.org.productservice.model.ProductVersion;
import tgdd.org.productservice.model.dto.ProductRequest;
import tgdd.org.productservice.repo.BrandRepo;
import tgdd.org.productservice.repo.CategoryRepo;
import tgdd.org.productservice.repo.ProductRepo;
import tgdd.org.productservice.repo.ProductVersionRepo;
import tgdd.org.productservice.service.ProductService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private BrandRepo brandRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private ProductVersionRepo productVersionRepo;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ProductMapper productMapper;

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
    public Product save(ProductRequest productRequest) throws IOException {
        String imgUrl = null;
        if (productRequest.getImg() != null && !productRequest.getImg().isEmpty()) {
            if (!cloudinaryService.validate(productRequest.getImg())) {
                throw new RuntimeException("Invalid image format");
            }
            Map<String, String> uploadResult = cloudinaryService.uploadImg(productRequest.getImg());
            imgUrl = uploadResult.get("secure_url");
        }
        Brand brand = brandRepo.findById(productRequest.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + productRequest.getBrandId()));
        Category category = categoryRepo.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productRequest.getCategoryId()));
        ProductVersion version = productVersionRepo.findById(productRequest.getVersionId())
                .orElseThrow(() -> new RuntimeException("ProductVersion not found with id: " + productRequest.getVersionId()));
        Product product = productMapper.toProduct(productRequest, version, brand, category, imgUrl);
        product.setQuantity(productRequest.getStockQuantity());

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

    @Override
    public Product deductStock(int productId, int quantity) {
        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        if (product.getQuantity()-product.getReserve() < quantity) {
            throw new RuntimeException("Insufficient stock for product id: " + productId);
        }
        product.setReserve(product.getReserve() + quantity);
        return productRepo.save(product);
    }
}
