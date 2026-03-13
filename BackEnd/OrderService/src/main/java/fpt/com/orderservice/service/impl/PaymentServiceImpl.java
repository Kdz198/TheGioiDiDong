package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.config.Producer;
import fpt.com.orderservice.exception.CustomException;
import fpt.com.orderservice.model.Order;
import fpt.com.orderservice.model.OrderDetail;
import fpt.com.orderservice.model.Payment;
import fpt.com.orderservice.model.Promotion;
import fpt.com.orderservice.model.dto.OrderRequest;
import fpt.com.orderservice.model.dto.PaymentStatusResponse;
import fpt.com.orderservice.model.enums.OrderStatus;
import fpt.com.orderservice.model.enums.PaymentStatus;
import fpt.com.orderservice.model.enums.PromotionType;
import fpt.com.orderservice.repo.OrderRepo;
import fpt.com.orderservice.repo.PaymentRepo;
import fpt.com.orderservice.repo.PromotionRepo;
import fpt.com.orderservice.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@Slf4j
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
    @Autowired
    private Producer producer;

    @Value("${payos.client-id}")
    private String clientId;
    @Value("${payos.api-key}")
    private String apiKey;
    @Autowired
    private RestTemplate restTemplate;

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
    public String save(String orderCode, String promotionCode) {
        Order order = orderRepo.findByOrderCode(orderCode);
        Promotion promotion = promotionRepo.findByCode(promotionCode);
        if (order == null) {
            throw new CustomException("Not found", HttpStatus.NOT_FOUND);
        }
        Payment payment = new Payment();
        int discount = 0;
        if (promotion != null) {
            promotion.setQuantity(promotion.getQuantity() - 1);
            promotionRepo.save(promotion);
            payment.setPromotion(promotion);
            discount = promotion.getType() == PromotionType.PERCENTAGE ? (int) (order.getTotalPrice() * promotion.getDiscountValue() / 100) : (int) promotion.getDiscountValue();
        }

        int amount = (int) (order.getTotalPrice() - discount);
        payment.setOrder(order);
        payment.setAmount(amount);
        payment.setPaymentMethod("PAYOS");
        payment.setStatus(PaymentStatus.PENDING);
        int randomPart = new Random().nextInt(1000);
        payment.setTransactionCode(String.valueOf(System.currentTimeMillis() * 1000 + randomPart));
        paymentRepo.save(payment);
        //gửi lại tiền qua payos sau khi áp dụng mã giảm giá

        return createPaymentLink(payment.getTransactionCode(), amount);
    }

    private String createPaymentLink(String transactionCode, long amount) {
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

    @Override
    public void handlePaymentSuccess(Webhook webhook) {
        try {
            System.out.println("Received PayOS webhook: " + webhook.toString());
            WebhookData data = payOS.webhooks().verify(webhook);
            String transactionCode = String.valueOf(data.getOrderCode());
            Payment payment = paymentRepo.findByTransactionCode(transactionCode);
            Order order = null;
            if (payment != null) {
                order = payment.getOrder();
                log.info("Payment successful for transaction code: " + transactionCode);
            } else {
                log.atError();
            }
            if (webhook.getDesc().equals("success")) {
                System.out.println("Payment successful for order: " + data.getOrderCode());
                order.setStatus(OrderStatus.PAID);
                payment.setStatus(PaymentStatus.COMPLETED);
            } else {
                order.setStatus(OrderStatus.CANCELED);
                payment.setStatus(PaymentStatus.FAILED);
            }
            paymentRepo.save(payment);
            orderRepo.save(order);
            producer.publishPaymentSuccess(order.getOrderCode());
        } catch (Exception e) {
            System.err.println("Error processing PayOS webhook: " + e.getMessage());
        }
    }

    @Override
    public Payment cancelPayment(String paymentCode) {
        Payment payment = paymentRepo.findByTransactionCode(paymentCode);
        Order order = null;
        if (payment != null) {
            order = payment.getOrder();

        }
        order.setStatus(OrderStatus.CANCELED);
        payment.setStatus(PaymentStatus.FAILED);
        paymentRepo.save(payment);
        orderRepo.save(order);
        producer.publishPaymentCancel(order.getOrderCode());
        return payment;
    }

    @Scheduled(fixedDelay = 300000)
    public void cancelPayment(){
        LocalDateTime times = LocalDateTime.now().minusMinutes(10);
        List<Payment> payments = paymentRepo.findByStatusAndDate(PaymentStatus.PENDING, times);

        for(Payment payment : payments) {
            try {
                System.out.println("Checking payment: " + payment.getId());
                String url = "https://api-merchant.payos.vn/v2/payment-requests/"
                        + payment.getTransactionCode();

                HttpHeaders headers = new HttpHeaders();
                headers.set("x-client-id", clientId);
                headers.set("x-api-key", apiKey);

                HttpEntity<String> entity = new HttpEntity<>(headers);

                ResponseEntity<PaymentStatusResponse> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        PaymentStatusResponse.class
                );

                if (response.getBody() != null) {
                    Order order = null;
                    if (payment != null) {
                        order = payment.getOrder();

                    }
                    String status = response.getBody().getData().getStatus();
                    if ("CANCELLED".equals(status) ||"EXPIRED".equals(status)) {
                        order.setStatus(OrderStatus.CANCELED);
                        payment.setStatus(PaymentStatus.FAILED);
                        orderRepo.save(order);
                        paymentRepo.save(payment);
                        producer.publishPaymentCancel(order.getOrderCode());
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}

