package tgdd.org.productservice.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tgdd.org.productservice.mapper.ProductMapper;
import tgdd.org.productservice.model.Brand;
import tgdd.org.productservice.model.Category;
import tgdd.org.productservice.model.Product;
import tgdd.org.productservice.model.ProductVersion;
import tgdd.org.productservice.model.dto.ProductRequest;
import tgdd.org.productservice.model.dto.ProductResponse;
import tgdd.org.productservice.model.dto.ProductUpdateRequest;
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
    public List<ProductResponse> findAll() {
        return productMapper.toProductResponseList(productRepo.findAll());
    }

    @Override
    public ProductResponse findById(int id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return productMapper.toProductResponse(product);
    }

    @Override
    public ProductResponse save(ProductRequest productRequest) throws IOException {
        String imgUrl = null;
        Map<String, String> uploadResult = cloudinaryService.uploadImg(productRequest.getImg());
        imgUrl = uploadResult.get("secure_url");

        Brand brand = brandRepo.findById(productRequest.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + productRequest.getBrandId()));
        Category category = categoryRepo.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + productRequest.getCategoryId()));
        ProductVersion version = productVersionRepo.findById(productRequest.getVersionId())
                .orElseThrow(() -> new RuntimeException("ProductVersion not found with id: " + productRequest.getVersionId()));
        Product product = productMapper.toProduct(productRequest);
        product.setVersion(version);
        product.setBrand(brand);
        product.setCategory(category);
        product.setImgUrl(imgUrl);
        product.setQuantity(productRequest.getStockQuantity());

        Product saved = productRepo.save(product);
        return productMapper.toProductResponse(saved);
    }


    @Override
    public ProductResponse update(ProductUpdateRequest request) throws IOException {
        System.out.println("Updating product with id: " + request.getId());
        Product existingProduct = productRepo.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getId()));
        String imgUrl = existingProduct.getImgUrl();
        if (request.getImg() != null && !request.getImg().isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadImg(request.getImg());
            imgUrl = uploadResult.get("secure_url");
        }
        Brand brand = brandRepo.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + request.getBrandId()));

        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        ProductVersion version = productVersionRepo.findById(request.getVersionId())
                .orElseThrow(() -> new RuntimeException("ProductVersion not found with id: " + request.getVersionId()));


        productMapper.updateProductFromRequest(request, existingProduct);
        existingProduct.setVersion(version);
        existingProduct.setBrand(brand);
        existingProduct.setCategory(category);
        existingProduct.setImgUrl(imgUrl);
        existingProduct.setActive(request.getActive());
        existingProduct.setQuantity(request.getStockQuantity());
        System.out.println(existingProduct.isActive());
        Product updated = productRepo.save(existingProduct);
        return productMapper.toProductResponse(updated);
    }

    @Override
    public void deleteById(int id) {
        productRepo.deleteById(id);
    }

    @Override
    public List<ProductResponse> findByBrandId(int brandId) {
        return productMapper.toProductResponseList(productRepo.findByBrandId(brandId));
    }

    @Override
    public List<ProductResponse> findByCategoryId(int categoryId) {
        return productMapper.toProductResponseList(productRepo.findByCategoryId(categoryId));
    }

    @Override
    public List<ProductResponse> findActiveProducts() {
        return productMapper.toProductResponseList(productRepo.findByActiveTrue());
    }

    @Override
    public List<ProductResponse> findInactiveProducts() {
        return productMapper.toProductResponseList(productRepo.findByActiveFalse());
    }

    @Override
    public ProductResponse deductStock(int productId, int quantity) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        if (product.getQuantity() - product.getReserve() < quantity) {
            throw new RuntimeException("Insufficient stock for product id: " + productId);
        }
        product.setReserve(product.getReserve() + quantity);
        Product saved = productRepo.save(product);
        return productMapper.toProductResponse(saved);
    }
}
