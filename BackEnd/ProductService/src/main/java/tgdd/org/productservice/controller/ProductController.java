package tgdd.org.productservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tgdd.org.productservice.model.dto.OrderRequest;
import tgdd.org.productservice.model.dto.ProductRequest;
import tgdd.org.productservice.model.dto.ProductResponse;
import tgdd.org.productservice.model.dto.ProductUpdateRequest;
import tgdd.org.productservice.service.ProductService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable int id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(@ModelAttribute ProductRequest product) throws IOException {
        return ResponseEntity.ok(productService.save(product));
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> updateProduct(@ModelAttribute ProductUpdateRequest product) throws IOException {
        return ResponseEntity.ok(productService.update(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable int id) {
        productService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<List<ProductResponse>> getProductsByBrand(@PathVariable int brandId) {
        return ResponseEntity.ok(productService.findByBrandId(brandId));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable int categoryId) {
        return ResponseEntity.ok(productService.findByCategoryId(categoryId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductResponse>> getActiveProducts() {
        return ResponseEntity.ok(productService.findActiveProducts());
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<ProductResponse>> getInactiveProducts() {
        return ResponseEntity.ok(productService.findInactiveProducts());
    }

    @PostMapping("/check-available")
    public ResponseEntity<OrderRequest> checkStockAvailable(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(productService.isStockAvailable(request));
    }
}
