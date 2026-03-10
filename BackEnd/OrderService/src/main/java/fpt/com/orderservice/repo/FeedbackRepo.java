package fpt.com.orderservice.repo;

import fpt.com.orderservice.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepo extends JpaRepository<Feedback, Integer> {
    List<Feedback> findByUserId(int userId);
    List<Feedback> findByProductId(int productId);

    Feedback findByOrOrderDetail_Id(int orderDetailId);
}

