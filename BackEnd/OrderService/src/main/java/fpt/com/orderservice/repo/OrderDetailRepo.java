package fpt.com.orderservice.repo;

import fpt.com.orderservice.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderDetailRepo extends JpaRepository<OrderDetail,Integer> {
    OrderDetail findById(int id);
}
