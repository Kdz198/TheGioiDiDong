package fpt.com.orderservice.service;

import fpt.com.orderservice.model.Promotion;

import java.util.List;

public interface PromotionService {
    List<Promotion> findAll();
    Promotion findById(int id);
    Promotion save(Promotion promotion);
    Promotion update(Promotion promotion);
    void deleteById(int id);
    List<Promotion> findActivePromotions();
    Promotion findByCode(String code);
}

