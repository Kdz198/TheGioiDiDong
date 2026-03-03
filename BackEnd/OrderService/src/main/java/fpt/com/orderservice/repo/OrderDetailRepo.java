package fpt.com.orderservice.repo;

import fpt.com.orderservice.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderDetailRepo extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrderId(int orderId);
    List<OrderDetail> findByProductId(int productId);
}

