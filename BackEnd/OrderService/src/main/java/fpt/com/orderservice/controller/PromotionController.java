package fpt.com.orderservice.controller;

import fpt.com.orderservice.model.Promotion;
import fpt.com.orderservice.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable int id) {
        return ResponseEntity.ok(promotionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        return ResponseEntity.ok(promotionService.save(promotion));
    }

    @PutMapping
    public ResponseEntity<Promotion> updatePromotion(@RequestBody Promotion promotion) {
        return ResponseEntity.ok(promotionService.update(promotion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable int id) {
        promotionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.findActivePromotions());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Promotion> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(promotionService.findByCode(code));
    }
}

