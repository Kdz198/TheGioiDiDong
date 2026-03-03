package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.model.Promotion;
import fpt.com.orderservice.repo.PromotionRepo;
import fpt.com.orderservice.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PromotionServiceImpl implements PromotionService {

    @Autowired
    private PromotionRepo promotionRepo;

    @Override
    public List<Promotion> findAll() {
        return promotionRepo.findAll();
    }

    @Override
    public Promotion findById(int id) {
        return promotionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
    }

    @Override
    public Promotion save(Promotion promotion) {
        return promotionRepo.save(promotion);
    }

    @Override
    public Promotion update(Promotion promotion) {
        if (!promotionRepo.existsById(promotion.getId())) {
            throw new RuntimeException("Promotion not found with id: " + promotion.getId());
        }
        return promotionRepo.save(promotion);
    }

    @Override
    public void deleteById(int id) {
        promotionRepo.deleteById(id);
    }

    @Override
    public List<Promotion> findActivePromotions() {
        return promotionRepo.findByActiveTrue();
    }

    @Override
    public Promotion findByCode(String code) {
        return promotionRepo.findByCode(code);
    }
}

