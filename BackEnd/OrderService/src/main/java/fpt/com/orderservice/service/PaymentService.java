package fpt.com.orderservice.service;

import fpt.com.orderservice.model.Payment;
import fpt.com.orderservice.model.enums.PaymentStatus;
import vn.payos.model.webhooks.Webhook;

import java.util.List;

public interface PaymentService {
    List<Payment> findAll();
    Payment findById(int id);
    String save(String orderCode,String promotionCode);
    Payment update(Payment payment);
    void deleteById(int id);
    List<Payment> findByOrderId(int orderId);
    List<Payment> findByStatus(PaymentStatus status);
    void handlePaymentSuccess(Webhook webhook);
    Payment cancelPayment(String paymentCode);
}

