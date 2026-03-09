package fpt.com.orderservice.controller;

import fpt.com.orderservice.model.Payment;
import fpt.com.orderservice.model.enums.PaymentStatus;
import fpt.com.orderservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.model.webhooks.Webhook;

import java.util.List;

@RestController
@RequestMapping("/api/orders/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.findAll());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable int id) {
        return ResponseEntity.ok(paymentService.findById(id));
    }

    @PostMapping("/make-payment")
    public ResponseEntity<String> createPayment(@RequestParam String orderCode,@RequestParam(required = false) String promotionCode) {
        return ResponseEntity.ok(paymentService.save(orderCode,promotionCode));
    }

    @PutMapping
    public ResponseEntity<Payment> updatePayment(@RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.update(payment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable int id) {
        paymentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Payment>> getByOrderId(@PathVariable int orderId) {
        return ResponseEntity.ok(paymentService.findByOrderId(orderId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payment>> getByStatus(@PathVariable PaymentStatus status) {
        return ResponseEntity.ok(paymentService.findByStatus(status));
    }

    @PostMapping("/webhook")
    public void handleWebhook(@RequestBody Webhook payload) {
        paymentService.handlePaymentSuccess(payload);
    }

    @PostMapping("/cancel")
    public ResponseEntity<Payment> cancelPayment(@RequestParam String paymentCode) {
        return ResponseEntity.ok(paymentService.cancelPayment(paymentCode));}
}

