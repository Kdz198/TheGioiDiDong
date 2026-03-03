package tgdd.org.productservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tgdd.org.productservice.model.Brand;
import tgdd.org.productservice.model.dto.BrandRequest;
import tgdd.org.productservice.service.BrandService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products/brands")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(brandService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable int id) {
        Brand brand = brandService.findById(id);
        return ResponseEntity.ok(brand);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Brand> createBrand(@ModelAttribute BrandRequest brand) throws IOException {
        return ResponseEntity.ok(brandService.save(brand));
    }

    @PutMapping
    public ResponseEntity<Brand> updateBrand(@RequestBody Brand brand) {
        return ResponseEntity.ok(brandService.update( brand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable int id) {
        brandService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
