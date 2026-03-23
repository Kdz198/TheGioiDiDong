package tgdd.org.productservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tgdd.org.productservice.model.dto.request.OrderRequest;
import tgdd.org.productservice.model.dto.request.ProductRequest;
import tgdd.org.productservice.model.dto.response.ProductResponse;
import tgdd.org.productservice.model.dto.request.ProductUpdateRequest;
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
    @Operation(

            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            encoding = {
                                    @Encoding(name = "product", contentType = "application/json")
                            }
                    )
            )
    )
    public ResponseEntity<ProductResponse> createProduct(@RequestPart ProductRequest product,@RequestPart(value = "img", required = false) MultipartFile img,@RequestPart(value = "img2", required = false) MultipartFile img2,@RequestPart(value = "img3", required = false) MultipartFile img3,@RequestPart(value = "img4", required = false) MultipartFile img4,@RequestPart(value = "img5", required = false) MultipartFile img5
                                                         ) throws IOException {
        return ResponseEntity.ok(productService.save(product, img, img2, img3, img4, img5));
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            encoding = {
                                    @Encoding(name = "product", contentType = "application/json")
                            }
                    )
            )
    )
    public ResponseEntity<ProductResponse> updateProduct(
            @RequestPart ProductUpdateRequest product,
            @RequestPart(value = "img", required = false) MultipartFile img,
            @RequestPart(value = "img2", required = false) MultipartFile img2,
            @RequestPart(value = "img3", required = false) MultipartFile img3,
            @RequestPart(value = "img4", required = false) MultipartFile img4,
            @RequestPart(value = "img5", required = false) MultipartFile img5
    ) throws IOException {
        return ResponseEntity.ok(productService.update(product, img, img2, img3, img4, img5));
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
    public ResponseEntity<OrderRequest> checkStockAvailable(@RequestBody @Valid OrderRequest request) {
        return ResponseEntity.ok(productService.isStockAvailable(request));
    }
}
