package tgdd.org.productservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tgdd.org.productservice.model.ProductVersion;
import tgdd.org.productservice.service.ProductVersionService;

import java.util.List;

@RestController
@RequestMapping("api/products/product-versions")
public class ProductVersionController {

    @Autowired
    private ProductVersionService productVersionService;

    @GetMapping
    public ResponseEntity<List<ProductVersion>> getAllProductVersions() {
        return ResponseEntity.ok(productVersionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductVersion> getProductVersionById(@PathVariable int id) {
        ProductVersion productVersion = productVersionService.findById(id);
        return ResponseEntity.ok(productVersion);
    }

    @PostMapping
    public ResponseEntity<ProductVersion> createProductVersion(@RequestBody ProductVersion productVersion) {
        ProductVersion savedVersion = productVersionService.save(productVersion);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedVersion);
    }

    @PutMapping
    public ResponseEntity<ProductVersion> updateProductVersion(@RequestBody ProductVersion productVersion) {
        return ResponseEntity.ok(productVersionService.update(productVersion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductVersion(@PathVariable int id) {
        productVersionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
