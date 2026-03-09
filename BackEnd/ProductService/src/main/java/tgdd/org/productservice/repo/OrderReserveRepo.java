package tgdd.org.productservice.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tgdd.org.productservice.model.OrderReserve;

public interface OrderReserveRepo extends JpaRepository<OrderReserve, String> {
    OrderReserve findByOrderCode(String orderCode);
}
