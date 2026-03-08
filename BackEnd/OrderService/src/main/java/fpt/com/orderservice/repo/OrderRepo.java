package fpt.com.orderservice.repo;

import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepo extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(int userId);
    List<Order> findByStatus(OrderStatus status);

    Order findByOrderCode(String orderCode);
}

