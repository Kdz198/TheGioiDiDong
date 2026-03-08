package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.exception.CustomException;
import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.Payment;
import fpt.com.orderservice.model.Promotion;
import fpt.com.orderservice.model.enums.PaymentStatus;
import fpt.com.orderservice.repo.OrderRepo;
import fpt.com.orderservice.repo.PaymentRepo;
import fpt.com.orderservice.repo.PromotionRepo;
import fpt.com.orderservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;

import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepo paymentRepo;
    @Autowired
    private OrderRepo orderRepo;
    @Autowired
    private PromotionRepo promotionRepo;
    @Autowired
    private PayOS payOS;
    @Value("${payos.return-url}")
    private String returnUrl;
    @Value("${payos.cancel-url}")
    private String cancelUrl;

    @Override
    public List<Payment> findAll() {
        return paymentRepo.findAll();
    }

    @Override
    public Payment findById(int id) {
        return paymentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    @Override
    @Transactional
    public String save(String orderCode,String promotionCode) {
        Order order = orderRepo.findByOrderCode(orderCode);
        Promotion promotion = promotionRepo.findByCode(promotionCode);
        if (order == null || promotion == null) {
            throw new CustomException("Not found", HttpStatus.NOT_FOUND);
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalPrice());
        payment.setPaymentMethod("PAYOS");
        payment.setPromotion(promotion);
        payment.setStatus(PaymentStatus.PENDING);
        int randomPart = new java.util.Random().nextInt(1000);
        payment.setTransactionCode(String.valueOf(System.currentTimeMillis()*1000 + randomPart));
        paymentRepo.save(payment);
        return createPaymentLink(payment.getTransactionCode(),payment.getAmount());
    }

    private String createPaymentLink(String transactionCode,long amount) {
        CreatePaymentLinkRequest paymentLinkRequest = CreatePaymentLinkRequest.builder()
                .orderCode(Long.valueOf(transactionCode))
                .amount(amount)
                .description("Thanh Toán Inblue")
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .build();
        String paymentLink = payOS.paymentRequests().create(paymentLinkRequest).getCheckoutUrl();
        return paymentLink;
    }

    @Override
    public Payment update(Payment payment) {
        if (!paymentRepo.existsById(payment.getId())) {
            throw new RuntimeException("Payment not found with id: " + payment.getId());
        }
        return paymentRepo.save(payment);
    }

    @Override
    public void deleteById(int id) {
        paymentRepo.deleteById(id);
    }

    @Override
    public List<Payment> findByOrderId(int orderId) {
        return paymentRepo.findByOrderId(orderId);
    }

    @Override
    public List<Payment> findByStatus(PaymentStatus status) {
        return paymentRepo.findByStatus(status);
    }
}

