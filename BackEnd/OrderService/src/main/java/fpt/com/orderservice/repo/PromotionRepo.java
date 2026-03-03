package fpt.com.orderservice.repo;

import fpt.com.orderservice.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PromotionRepo extends JpaRepository<Promotion, Integer> {
    List<Promotion> findByActiveTrue();
    Promotion findByCode(String code);

}

