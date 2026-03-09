package fpt.com.orderservice.repo;

import fpt.com.orderservice.model.Payment;
import fpt.com.orderservice.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepo extends JpaRepository<Payment, Integer> {
    List<Payment> findByOrderId(int orderId);
    List<Payment> findByStatus(PaymentStatus status);

    Payment findByTransactionCode(String transactionCode);
}

